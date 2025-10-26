const API = 'https://api.mega-star.uz:5000';

export async function CashbackUser({
  phoneNumber,
  sessionId,
}: {
  phoneNumber: string;
  sessionId: string;
}) {
  try {
    const response = await fetch(`${API}/CashbackUsers/998${phoneNumber}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: sessionId,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {}
}

export async function TopItems({
  cardCode,
  sessionId,
}: {
  cardCode: string;
  sessionId: string;
}) {
  try {
    const response = await fetch(`${API}/TopItems?cardCode=${cardCode}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: sessionId,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {}
}

export async function ShopAddress({ sessionId }: { sessionId: string }) {
  try {
    const response = await fetch(`${API}/Shops`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: sessionId,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {}
}

export async function OrdersData({
  cardCode,
  sessionId,
  id,
}: {
  cardCode?: string;
  sessionId: string;
  id?: string;
}) {
  const response = await fetch(
    id
      ? `${API}/Orders/${id}`
      : `${API}/Orders?cardCode=${cardCode}&isActive=true`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: sessionId,
      },
    },
  );

  const result = await response.json();
  return result;
}

export async function HistoryData({
  cardCode,
  sessionId,
}: {
  cardCode?: string;
  sessionId: string;
}) {
  const response = await fetch(`${API}/CashbackUsers/History/${cardCode}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Cookie: sessionId,
    },
  });

  const result = await response.json();
  return result;
}

export async function FeedbackType({ sessionId }: { sessionId: string }) {
  const response = await fetch(`${API}/Feedback/Types`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Cookie: sessionId,
    },
  });

  const result = await response.json();
  return result;
}

export async function Invoices({
  sessionId,
  id,
}: {
  sessionId: string;
  id: string;
}) {
  const response = await fetch(`${API}/Invoices/${id}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Cookie: sessionId,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Invoices api: ${response.status}`);
  }

  const result = await response.json();
  return result;
}
export async function Returns({
  sessionId,
  id,
}: {
  sessionId: string;
  id: string;
}) {
  const response = await fetch(`${API}/Returns/${id}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Cookie: sessionId,
    },
  });

  const result = await response.json();
  return result;
}

export async function News({ sessionId }: { sessionId: string }) {
  const response = await fetch(`${API}/News`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Cookie: sessionId,
    },
  });

  const result = await response.json();
  return result;
}

export async function ProductsData({
  cardCode,
  sessionId,
  page,
  filters,
}: {
  cardCode: string;
  sessionId: string;
  page: number;
  filters?: {
    categories?: number[];
    brands?: number[];
    priceMin?: number;
    priceMax?: number;
    query?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}) {
  const params = new URLSearchParams();

  params.append('cardCode', cardCode);
  params.append('page', String(page));

  if (filters?.query) params.append('q', filters.query);
  if (filters?.categories?.length)
    params.append('groups', filters.categories.join(','));
  if (filters?.brands?.length)
    params.append('brands', filters.brands.join(','));
  if (filters?.priceMin) params.append('priceMin', String(filters.priceMin));
  if (filters?.priceMax) params.append('priceMax', String(filters.priceMax));
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
  const url = `${API}/Items?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Cookie: sessionId || '1',
    },
  });

  const result = await response.json();
  return result;
}

export async function TestNotification({
  token,
  cardCode,
  sessionId,
}: {
  token: string;
  cardCode: string;
  sessionId: string;
}) {
  const response = await fetch(
    `${API}/Notifications/Test?token=${token}&cardCode=${cardCode}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: sessionId,
      },
    },
  );

  const data = await response.json();
  console.log(data);

  return data;
}

export async function ItemGroups({ sessionId }: { sessionId: string }) {
  const response = await fetch(`${API}/ItemGroups`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Cookie: sessionId,
    },
  });

  const result = await response.json();
  return result;
}

export async function ItemBrands({ sessionId }: { sessionId: string }) {
  const response = await fetch(`${API}/ItemBrands`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Cookie: sessionId,
    },
  });

  const result = await response.json();
  return result;
}
