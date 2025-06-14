import { gql } from '@apollo/client'
import { useQuery } from '@tanstack/react-query';
import { apolloClient } from '../configs/apolloClient';

const GET_USER = gql`
query User {
  getLoggedInUser {
    id
    role
  }
}
`;
const fetchUser = async (): Promise<{ id: string; role: string }> => {
    const response = await apolloClient.query({
        query: GET_USER,
    });
    return {
        id: response.data.getLoggedInUser.id,
        role: response.data.getLoggedInUser.role
    };
}

const useUser = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['user'],
        queryFn: fetchUser,
        staleTime: 1000 * 60 * 5,
    });

    return {
        user: data || null,
        isLoading,
        error,
        refetch
    };
}

export default useUser