import { authClient } from "@/auth-client";
import { useQuery } from "@tanstack/react-query";

export const useSubscription = () => {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const { data } = await authClient.customer.state();
      return data;
    },
  });
};

export const useHasActiveSubscription = () => {
  const { data: customerData, isLoading, ...rest } = useSubscription();
  const hasActiveSubscription =
    customerData?.activeSubscriptions &&
    customerData.activeSubscriptions.length > 0;
  return {
    hasActiveSubscription,
    isLoading,
    subscription: customerData?.activeSubscriptions[0],
    ...rest,
  };
};
