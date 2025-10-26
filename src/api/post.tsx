const API = 'https://api.mega-star.uz:5000';

export const SessionIdApi = async () => {
  try {
    const response = await fetch(`${API}/Login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Password: '1234',
        UserName: 'Support',
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Login details:', error);
    throw error;
  }
};

export const UpdateData = async ({
  cardName,
  phone,
  cardCode,
  sessionId,
}: {
  cardName: string;
  phone: string;
  cardCode: string;
  sessionId: string;
}) => {
  const bodyData: any = {
    CardForeignName: cardName,
  };

  if (phone) {
    bodyData.Phone1 = phone;
  }

  const response = await fetch(`${API}/CashbackUsers/Update/${cardCode}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Cookie: sessionId,
    },
    body: JSON.stringify(bodyData),
  });

  const data = await response.json();
  return data;
};

export const SendFeedback = async ({
  cardCode,
  phone,
  sessionId,
  desc,
  feedbackType,
}: {
  cardCode: string;
  phone: string;
  sessionId: string;
  desc: string;
  feedbackType: string;
}) => {
  try {
    const response = await fetch(`${API}/Feedback`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: sessionId,
      },
      body: JSON.stringify({
        cardCode: cardCode,
        phone: phone,
        feedbackType: feedbackType,
        text: desc,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Feedback details:', error);
    throw error;
  }
};

export async function SetOrder({
  orderDetails,
  sessionId,
}: {
  orderDetails: any;
  sessionId: string;
}) {
  const headers: any = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Cookie: sessionId,
  };
  const response = await fetch(`${API}/Orders`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(orderDetails),
  });

  const result = await response.json();
  return result;
}
export async function VerificationCode({
  phoneNumber,
  sessionId,
}: {
  phoneNumber: string;
  sessionId: string;
}) {
  const headers: any = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Cookie: sessionId,
  };
  const response = await fetch(`${API}/GetOtp`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ phone: phoneNumber }),
  });

  const result = await response.json();
  return result;
}
export async function NotificationRegister({
  token,
  cardCode,
  sessionId,
}: {
  token: string;
  cardCode: string;
  sessionId: string;
}) {
  const response = await fetch(
    `${API}/Notifications/Register?token=${token}&cardCode=${cardCode}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: sessionId,
      },
    },
  );

  const data = await response.json();
  return data;
}
