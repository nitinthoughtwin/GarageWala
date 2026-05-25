import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface ProviderProfile {
  id: string;
  name: string;
  phone: string;
  walletBalance: number;
  totalOrders: number;
  rating: string | number;
  skills: string[];
  vehicleType?: 'BIKE' | 'CAR';
  aadharNumber?: string;
  isOnline?: boolean;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface OrderRequest {
  id: string;
  userId: string;
  userAddress: string;
  userLat: number;
  userLng: number;
  serviceType: string;
  vehicleType: 'BIKE' | 'CAR';
  distanceKm: number;
  totalPrice: number;
  platformCommission: number;
  providerEarning: number;
  otp?: string;
}

interface AppContextType {
  token: string | null;
  profile: ProviderProfile | null;
  isOnline: boolean;
  incomingRequest: OrderRequest | null;
  activeOrder: OrderRequest | null;
  socket: any | null;
  setUserData: (profile: ProviderProfile | null, token: string | null) => void;
  clearUserData: () => void;
  setOnlineStatus: (status: boolean) => void;
  setIncomingRequest: (request: OrderRequest | null) => void;
  setActiveOrder: (order: OrderRequest | null) => void;
  setSocketInstance: (socket: any) => void;
  updateWalletStats: (balance: number, ordersCount: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [isOnline, setIsOnlineState] = useState<boolean>(false);
  const [incomingRequest, setIncomingRequestState] = useState<OrderRequest | null>(null);
  const [activeOrder, setActiveOrderState] = useState<OrderRequest | null>(null);
  const [socket, setSocketState] = useState<any | null>(null);

  const setUserData = (prof: ProviderProfile | null, tok: string | null) => {
    setProfile(prof);
    setToken(tok);
    if (prof) {
      setIsOnlineState(!!prof.isOnline);
    }
  };

  const clearUserData = () => {
    setToken(null);
    setProfile(null);
    setIsOnlineState(false);
    setIncomingRequestState(null);
    setActiveOrderState(null);
    if (socket) {
      socket.disconnect();
      setSocketState(null);
    }
  };

  const setOnlineStatus = (status: boolean) => {
    setIsOnlineState(status);
    if (profile) {
      setProfile({
        ...profile,
        isOnline: status,
      });
    }
  };

  const setIncomingRequest = (request: OrderRequest | null) => {
    setIncomingRequestState(request);
  };

  const setActiveOrder = (order: OrderRequest | null) => {
    setActiveOrderState(order);
  };

  const setSocketInstance = (sock: any) => {
    setSocketState(sock);
  };

  const updateWalletStats = (balance: number, ordersCount: number) => {
    if (profile) {
      setProfile({
        ...profile,
        walletBalance: balance,
        totalOrders: ordersCount,
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        token,
        profile,
        isOnline,
        incomingRequest,
        activeOrder,
        socket,
        setUserData,
        clearUserData,
        setOnlineStatus,
        setIncomingRequest,
        setActiveOrder,
        setSocketInstance,
        updateWalletStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
