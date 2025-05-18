
/**
 * Service pour interagir avec l'API de paiement Lygos
 */
 
const LYGOS_API_KEY = 'lygosapp-1b0aabd2-e115-4224-bc8f-254d355d62a4';

export interface LygosCreatePaymentResponse {
  id: string;
  amount: number;
  currency: string;
  shop_name: string;
  message: string;
  user_id: string;
  creation_date: string;
  link: string;
  order_id: string;
  success_url: string;
  failure_url: string;
}

export interface LygosVerifyPaymentResponse {
  order_id: string;
  status: string;
}

/**
 * Crée une session de paiement Lygos
 */
export async function createPaymentSession(
  orderId: string, 
  amount: number, 
  successUrl: string, 
  failureUrl: string
): Promise<LygosCreatePaymentResponse> {
  const options = {
    method: 'POST',
    headers: {
      'api-key': LYGOS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: "Achat de licence Whatsapp bot",
      success_url: successUrl,
      failure_url: failureUrl,
      amount: amount, // Montant en FCFA
      shop_name: "Digit-service",
      order_id: orderId
    })
  };

  const response = await fetch('https://api.lygosapp.com/v1/gateway', options);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erreur lors de la création du paiement");
  }

  return response.json();
}

/**
 * Vérifie le statut d'un paiement Lygos
 */
export async function verifyPayment(orderId: string): Promise<LygosVerifyPaymentResponse> {
  const options = {
    method: 'GET',
    headers: { 'api-key': LYGOS_API_KEY }
  };

  const response = await fetch(`https://api.lygosapp.com/v1/gateway/payin/${orderId}`, options);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erreur lors de la vérification du paiement");
  }

  return response.json();
}
