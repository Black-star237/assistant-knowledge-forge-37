
// Lygos API Key
const LYGOS_API_KEY = "lygosapp-1b0aabd2-e115-4224-bc8f-254d355d62a4";
const LYGOS_API_URL = "https://api.lygosapp.com/v1";

/**
 * Interface pour la réponse de création de session de paiement
 */
export interface LygosPaymentResponse {
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

/**
 * Interface pour la réponse de vérification de paiement
 */
export interface LygosVerificationResponse {
  order_id: string;
  status: string;
}

/**
 * Crée une session de paiement via Lygos
 * @param orderId Identifiant de la commande (string)
 * @param amount Montant en FCFA
 * @param successUrl URL de redirection en cas de succès
 * @param failureUrl URL de redirection en cas d'échec
 */
export const createPaymentSession = async (
  orderId: string,
  amount: number,
  successUrl: string,
  failureUrl: string
): Promise<LygosPaymentResponse> => {
  const options = {
    method: "POST",
    headers: {
      "api-key": LYGOS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "Achat de licence Whatsapp bot",
      success_url: successUrl,
      failure_url: failureUrl,
      amount: amount,
      shop_name: "Digit-service",
      order_id: orderId,
    }),
  };

  try {
    const response = await fetch(`${LYGOS_API_URL}/gateway`, options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating payment session:", error);
    throw error;
  }
};

/**
 * Vérifie le statut d'un paiement Lygos
 * @param orderId Identifiant de la commande (string)
 */
export const verifyPayment = async (orderId: string): Promise<LygosVerificationResponse> => {
  const options = {
    method: "GET",
    headers: { "api-key": LYGOS_API_KEY },
  };

  try {
    const response = await fetch(`${LYGOS_API_URL}/gateway/payin/${orderId}`, options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
};
