export interface UserResponse {
  status: string;
  data: UserData;
  error: null | {
    code: string;
    message: string;
  };
}
export interface UserData {
  cardCode: string;
  cardName: string;
  currentCashback: number;
  phone: string;
  blocked: boolean;
  monthlyPlan: number;
  monthlyFact: number;
  quarterlyPlan: number;
  quarterlyFact: number;
  yearlyPlan: number;
  yearlyFact: number;
  notificationToken: string | null;
  lastCashbacks: LastCashbacks[];
}
export interface LastCashbacks {
  transId: number;
  date: string;
  amount: number;
}

export interface UserContextType {
  language: string;
  setLanguage: (lang: string) => void;
  sessionId: string;
  setSessionId: (id: string) => void;
  userData: UserData | null;
  setUserData: (data: UserData) => void;
  oneTimeCode: number | null;
  setOneTimeCode: (code: number) => void;
  cartItem: any;
  setCartItem: (data: any) => void;
  lastVisitedRoute: string;
  setLastVisitedRoute: (count: string) => void;
}

export interface ProgressBarProps {
  value: number; // Hozirgi qiymat
  max: number; // Maksimal qiymat
}

export interface Transaction {
  type: string;
  docEntry: number;
  docDate: string;
  docTime: string;
  cardCode: string;
  cardName: string;
  shopName: string;
  docTotal: number;
  cashbackAccrued: number;
  cashbackWithdrew: number;
}

export interface HistoryProps {
  data: Transaction[];
  status: string;
  error: null | {
    code: string;
    message: string;
  };
}
export interface ShopAddressResponse {
  status: string;
  data: ShopAddressData[];
  error: null | {
    code: string;
    message: string;
  };
}
export interface ShopAddressData {
  shopName: string;
  shopCode: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
}

export interface ItemsResponse {
  status: string;
  data: ItemInterface[];
  error: null | {
    code: string;
    message: string;
  };
}
export interface ItemInterface {
  itemCode: string;
  itemName: string;
  itemImage: string;
  itemsGroupCode: number;
  quantityOnStock: number;
  committed: number;
  separateInvoiceItem: number;
  noDiscountItem: number;
  price: number;
  discountedPrice: number;
  basePrice: number;
  cashbackPercent: number;
  volumePeriodDiscount: number;
  volumePeriodDiscountLineNum: number;
  specialBpPricesDiscount: number;
  specialBpPricesDiscountLineNum: number;
  discountApplied: number;
  discountType: string;
  discountLineNum: number;
  baseDiscountedPrice: number;
  paidQuantity: number | null;
  freeQuantity: number | null;
  maxFreeQuantity: number | null;
}
export interface Invoice {
  docDate: string;
  docDueDate: string;
  cardCode: string;
  docTotalUZS: number;
  docTotalBeforeDiscountUZS: number;
  lines: InvoiceLine[];
  priceListCode: number;
  phone: string;
  shopCode: string;
}
export interface InvoiceLine {
  itemImage: string;
  itemCode: string;
  description: string;
  quantity: number;
  freeItemQuantity: number;
  discountPercent: number;
  discountType: string;
  isFreeItem: boolean;
  cashbackPercent: number;
  priceBeforeDiscount: number;
  price: number;
  discountedPrice: number;
  warehouseCode: string | null;
  maxQuantity: number;
  discountLineNum: number;
  paidQuantity: number | null;
  freeQuantity: number | null;
  maxFreeQuantity: number | null;
}
export interface QRCodeData {
  cardCode?: string;
  cardName?: string;
  currentCashback?: number;
  timeStamp: string;
}

export interface OrdersResponce {
  status: string;
  data: OrdersData[];
  error: null | {
    code: string;
    message: string;
  };
}
export interface OrdersData {
  branchId: number;
  orderStatus: string;
  docEntry: number;
  docNum: number;
  docDate: string;
  docDueDate: string;
  docTime: string;
  cardCode: string;
  cardName: string;
  shopCode: string;
  shopName: string;
  totalDiscountPercent: number;
  totalDiscountSum: number;
  docTotal: any;
  docTotalUZS: number;
  docTotalBeforeDiscountUZS: number;
  docRate: number;
  currentDocRate: number;
  cashbackWithdrew: any;
  cashbackAccrued: number;
  lines: any;
  comments: any;
  phone: any;
  priceListCode: any;
  slpCode: any;
  deliveryAddress: string | any;
  latitude: any;
  longitude: any;
}

export interface OrderResponce {
  status: string;
  data: OrderData;
  error: null | {
    code: string;
    message: string;
  };
}
export interface OrderData {
  branchId: number;
  orderStatus: string;
  docEntry: number;
  docNum: number;
  docDate: string;
  docDueDate: string;
  docTime: string;
  cardCode: string;
  cardName: string;
  shopCode: string;
  shopName: string;
  totalDiscountPercent: number;
  totalDiscountSum: number;
  docTotal: any;
  docTotalUZS: number;
  docTotalBeforeDiscountUZS: number;
  docRate: number;
  currentDocRate: number;
  cashbackWithdrew: number;
  cashbackAccrued: number;
  lines: InvoiceLine[];
  comments: any;
  phone: any;
  priceListCode: any;
  slpCode: any;
  deliveryAddress: string;
  latitude: any;
  longitude: any;
}

export interface FeedbackTypeResponse {
  status: string;
  data: [
    {
      code: string;
      name: string;
    },
    {
      code: string;
      name: string;
    },
  ];
  error: null | {
    code: string;
    message: string;
  };
}

export interface FeedbackResponse {
  status: string;
  data: {
    cardCode: string;
    phone: string;
    feedbackType: string;
    date: string;
    text: string;
  };
  error: null | {
    code: string;
    message: string;
  };
}
export interface HistoryDetailsResponse {
  data: {
    branchId: number;
    cardCode: string;
    cardName: string;
    cashbackAccrued: number;
    cashbackWithdrew: number;
    comments: string | null;
    currentDocRate: number;
    deliveryAddress: string | null;
    docDate: string;
    docDueDate: string;
    docEntry: number;
    docNum: number;
    docRate: number;
    docTime: string;
    docTotal: any;
    docTotalBeforeDiscountUZS: number;
    docTotalUZS: number;
    latitude: string | null;
    lines: HistoryDetailsLines[];
    longitude: string | null;
    orderStatus: any;
    phone: string | null;
    priceListCode: string | null;
    shopCode: string;
    shopName: string;
    slpCode: any;
    totalDiscountPercent: number;
    totalDiscountSum: number;
  };
  error: null | {
    code: string;
    message: string;
  };
  status: string;
}

export interface HistoryDetailsLines {
  itemImage?: string;
  lineNum: number;
  itemCode: string;
  description: string;
  priceUSD: any;
  price: number;
  unitPriceUSD: any;
  discountPercent: number;
  basePrice: any;
  basePriceUSD: any;
  warehouseCode: string;
  discountType: string;
  isFreeItem: boolean;
  cashbackPercent: number;
  quantity: number;
  freeQuantity: number;
  lineCashbackAccrued: number;
  priceBeforeDiscount: number;
  lineTotalBeforeDiscount: number;
  lineTotal: number;
}

export interface StoriesResponse {
  status: string;
  data: StoriesData[];
  error: null | {
    code: string;
    message: string;
  };
}
export interface StoriesData {
  thumbnailImage: string;
  fullSizeImage: string;
  link: null;
}
export interface VerificationResponse {
  data: {
    otpCode: string;
    phone: string;
  };
  error: null | {
    code: string;
    message: string;
  };
  status: string;
}
export type StoredNotification = {
  id: number;
  title: string;
  body: string;
  dateTime: string;
  isRead: boolean;
};

export const STORAGE_KEY = '@notifications';
