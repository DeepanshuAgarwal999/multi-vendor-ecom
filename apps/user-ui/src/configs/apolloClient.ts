import { ApolloClient, InMemoryCache, createHttpLink, fromPromise, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { UserService } from '../services/user.services';

const httpLink = createHttpLink({
  uri: 'http://localhost:8080/api/graphql',
  credentials: 'include', // This is correct - it sends cookies with requests
  fetchOptions: {
    mode: 'cors',
  },
});

// Function to refresh token
const generateNewToken = async () => {
  try {
    const refreshResult = await UserService.refreshToken();
    // Check more comprehensively for success indicators
    if (refreshResult?.data?.message || refreshResult?.data?.refreshTokenUser || refreshResult?.data?.success) {
      console.log('Token refresh successful:', refreshResult);
      return {
        success: true,
      };
    }
    console.warn('Token refresh failed with response:', refreshResult);
    return { success: false };
  } catch (error) {
    console.error('Token refresh error:', error);
    return { success: false };
  }
};

// Track if a token refresh is in progress
let isRefreshing = false;
// Queue of operations to retry after token refresh
let pendingRequests: Function[] = [];

// Function to process the queue of pending operations
const processQueue = (success: boolean) => {
  pendingRequests.forEach(callback => callback(success));
  pendingRequests = [];
};
const handleLogOut = () => {
  if (window.location.pathname !== '/login' && window.location.pathname !== '/forgot-password') {
    window.location.href = '/login';
  }
};
// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      // Check if error is an authentication error
      if (err.extensions?.code === 'UNAUTHENTICATED' || err.message.includes('authentication')) {
        if (!isRefreshing) {
          isRefreshing = true;

          // Try to refresh token
          return fromPromise(
            generateNewToken()
              .then(result => {
                // Process any pending requests with the new token
                processQueue(result.success);
                return result;
              })
              .catch(error => {
                // On refresh failure, clear pending requests
                processQueue(false);
                console.error('Failed to refresh token:', error);
                // Redirect to login or handle as needed
                handleLogOut();
                return { success: false };
              })
              .finally(() => {
                isRefreshing = false;
              })
          ).flatMap(result => {
            // If token refresh was successful, retry the operation
            if (result.success) {
              return forward(operation);
            }
            // If token refresh failed, redirect to login
            handleLogOut();
            return forward(operation);
          });
        } else {
          // If already refreshing, add this operation to queue
          return fromPromise(
            new Promise(resolve => {
              pendingRequests.push((success: boolean) => {
                resolve(success);
              });
            })
          ).flatMap(success => {
            // Only retry if refresh was successful
            if (success) {
              return forward(operation);
            }
            handleLogOut();
            return forward(operation);
          });
        }
      }
    }
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
    },
  };
});

// Combine the links
const link = ApolloLink.from([errorLink, authLink.concat(httpLink)]);
export const apolloClient = new ApolloClient({
  link,
  credentials: 'include',
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});
