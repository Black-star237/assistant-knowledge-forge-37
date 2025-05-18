
import { supabase } from "@/integrations/supabase/client";

// Clé d'API pour WaAPI
const WAAPI_TOKEN = "n5Jta55eeuyzDPSCqZSz87Q6W7L4gUDPhme1ol5Y83e57dec";
const WAAPI_BASE_URL = "https://waapi.app/api/v1";

export interface WaAPIResponse<T = any> {
  status: string;
  data?: T;
  error?: string;
  links?: {
    self: string;
  };
}

export interface QRCodeResponse {
  qrCode: {
    status: string;
    instanceId: string;
    data: {
      qr: string;
      qr_code: string;
    };
  };
}

export interface PairingCodeResponse {
  data: {
    status: string;
    instanceId: number;
    data: {
      pairingCode: string;
    };
  };
}

export interface GenericResponse {
  data: {
    status: string;
    instanceId: number;
  };
}

/**
 * Service d'intégration avec WaAPI
 */
export const waApiService = {
  /**
   * Obtient un QR Code pour la connexion WhatsApp
   * @param instanceId ID de l'instance WaAPI
   */
  async getQrCode(instanceId: string): Promise<QRCodeResponse> {
    const response = await fetch(`${WAAPI_BASE_URL}/instances/${instanceId}/client/qr`, {
      headers: {
        'Authorization': `Bearer ${WAAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération du QR code: ${response.statusText}`);
    }
    
    return await response.json();
  },

  /**
   * Demande un code de jumelage pour la connexion WhatsApp
   * @param instanceId ID de l'instance WaAPI
   * @param phoneNumber Numéro de téléphone WhatsApp
   */
  async requestPairingCode(instanceId: string, phoneNumber: string): Promise<PairingCodeResponse> {
    const response = await fetch(`${WAAPI_BASE_URL}/instances/${instanceId}/client/action/request-pairing-code`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WAAPI_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phoneNumber })
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la demande du code de jumelage: ${response.statusText}`);
    }
    
    return await response.json();
  },

  /**
   * Déconnecte l'instance WhatsApp
   * @param instanceId ID de l'instance WaAPI
   */
  async logout(instanceId: string): Promise<GenericResponse> {
    const response = await fetch(`${WAAPI_BASE_URL}/instances/${instanceId}/client/action/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WAAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la déconnexion: ${response.statusText}`);
    }
    
    return await response.json();
  },

  /**
   * Redémarre l'instance WhatsApp
   * @param instanceId ID de l'instance WaAPI
   */
  async reboot(instanceId: string): Promise<GenericResponse> {
    const response = await fetch(`${WAAPI_BASE_URL}/instances/${instanceId}/client/action/reboot`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WAAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors du redémarrage: ${response.statusText}`);
    }
    
    return await response.json();
  },
  
  /**
   * Met à jour le statut de connexion d'une licence dans la base de données
   * @param licenceId ID de la licence
   * @param isConnected Statut de connexion
   */
  async updateLicenceStatus(licenceId: string | number, isConnected: boolean): Promise<void> {
    const { error } = await supabase
      .from("Licences Whatsapp")
      .update({ n8n_connected: isConnected })
      .eq("id", licenceId);
      
    if (error) {
      throw new Error(`Erreur lors de la mise à jour du statut: ${error.message}`);
    }
  }
};
