import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface UserData {
  id: string;
  name: string;
  phone: string;
  email?: string;
  profilePhoto?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface PriceEstimate {
  basePrice: number;
  distanceCharge: number;
  totalPrice: number;
  platformCommission: number;
  providerEarning: number;
  distanceKm: number;
  durationMins?: number;
  source?: string;
}

export interface ProviderData {
  id?: string;
  name: string;
  phone: string;
  rating: string | number;
  profilePhotoUrl?: string;
  currentLat?: number;
  currentLng?: number;
}

export interface OrderData {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'PROVIDER_ON_WAY' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  otp: string;
  vehicleType: 'BIKE' | 'CAR';
  serviceType: string;
  userAddress: string;
  totalPrice: number;
}

interface AppContextType {
  user: UserData | null;
  token: string | null;
  selectedVehicle: 'BIKE' | 'CAR';
  selectedService: string;
  coordinates: Coordinates;
  userAddress: string;
  priceEstimate: PriceEstimate | null;
  activeOrder: OrderData | null;
  assignedProvider: ProviderData | null;
  socket: any | null;
  setUserData: (user: UserData | null, token: string | null) => void;
  clearUserData: () => void;
  setSelectedVehicle: (vehicle: 'BIKE' | 'CAR') => void;
  setSelectedService: (service: string) => void;
  setCoordinatesAndAddress: (coords: Coordinates, address: string) => void;
  setPriceEstimate: (estimate: PriceEstimate | null) => void;
  setActiveOrder: (order: OrderData | null) => void;
  setAssignedProvider: (provider: ProviderData | null | ((prev: ProviderData | null) => ProviderData | null)) => void;
  setSocketInstance: (socket: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicleState] = useState<'BIKE' | 'CAR'>('BIKE');
  const [selectedService, setSelectedServiceState] = useState<string>('PUNCTURE');
  const [coordinates, setCoordinatesState] = useState<Coordinates>({ latitude: 19.0758, longitude: 72.8770 });
  const [userAddress, setUserAddressState] = useState<string>('Phoenix Marketcity, Kurla, Mumbai');
  const [priceEstimate, setPriceEstimateState] = useState<PriceEstimate | null>(null);
  const [activeOrder, setActiveOrderState] = useState<OrderData | null>(null);
  const [assignedProvider, setAssignedProviderState] = useState<ProviderData | null>(null);
  const [socket, setSocketState] = useState<any | null>(null);

  const setUserData = (user: UserData | null, token: string | null) => {
    setUser(user);
    setToken(token);
  };

  const clearUserData = () => {
    setUser(null);
    setToken(null);
    setActiveOrderState(null);
    setAssignedProviderState(null);
    if (socket) {
      socket.disconnect();
      setSocketState(null);
    }
  };

  const setSelectedVehicle = (vehicle: 'BIKE' | 'CAR') => {
    setSelectedVehicleState(vehicle);
  };

  const setSelectedService = (service: string) => {
    setSelectedServiceState(service);
  };

  const setCoordinatesAndAddress = (coords: Coordinates, address: string) => {
    setCoordinatesState(coords);
    setUserAddressState(address);
  };

  const setPriceEstimate = (estimate: PriceEstimate | null) => {
    setPriceEstimateState(estimate);
  };

  const setActiveOrder = (order: OrderData | null) => {
    setActiveOrderState(order);
  };

  const setAssignedProvider = (provider: ProviderData | null | ((prev: ProviderData | null) => ProviderData | null)) => {
    setAssignedProviderState(provider);
  };

  const setSocketInstance = (socket: any) => {
    setSocketState(socket);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        selectedVehicle,
        selectedService,
        coordinates,
        userAddress,
        priceEstimate,
        activeOrder,
        assignedProvider,
        socket,
        setUserData,
        clearUserData,
        setSelectedVehicle,
        setSelectedService,
        setCoordinatesAndAddress,
        setPriceEstimate,
        setActiveOrder,
        setAssignedProvider,
        setSocketInstance,
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
