import api from './api';
import type { Plot, SoilType, EnvironmentType, CropStage, CropType } from '../types';

export interface CreatePlotPayload {
  plotName: string;
  farmSize: number;
  soilType: SoilType;
  cropType: CropType;
  environmentType?: EnvironmentType;
  sowingDate: string;
  location: {
    address: string;
    state: string;
    district: string;
    lat: number;
    lng: number;
  };
  expectedHarvestDate?: string | null;
  actualHarvestDate?: string | null;
  imageUrl?: string;
}

export interface UpdatePlotPayload extends Partial<CreatePlotPayload> {
  cropStage?: CropStage;
}

const plotService = {
  /**
   * Fetch all active plots for the logged-in user.
   */
  getPlots: async (): Promise<{ success: boolean; data: Plot[] }> => {
    const response = await api.get('/plot');
    return response.data;
  },

  /**
   * Fetch a single plot by ID.
   */
  getPlotById: async (id: string): Promise<{ success: boolean; data: Plot }> => {
    const response = await api.get(`/plot/${id}`);
    return response.data;
  },

  createPlot: async (data: CreatePlotPayload): Promise<{ success: boolean; message: string; data: Plot }> => {
    // Strip frontend-only fields before sending to strictly-validated backend
    const apiPayload = { ...data };
    delete apiPayload.imageUrl;
    
    console.log('[PlotService] Creating plot with payload:', JSON.stringify(apiPayload, null, 2));
    
    try {
      const response = await api.post('/plot', apiPayload);
      
      // Attach the image locally to the returned data so the UI continues to show it
      if (response.data?.success && data.imageUrl && response.data.data) {
        response.data.data.imageUrl = data.imageUrl;
      }
      return response.data;
    } catch (err: any) {
      console.error('[PlotService] Server error response:', err.response?.status, err.response?.data);
      console.error('[PlotService] Full error:', err.message);
      if (err.response?.status === 401) {
        throw new Error('Session expired. Please log out and log back in.');
      }
      throw err;
    }
  },

  updatePlot: async (id: string, data: UpdatePlotPayload): Promise<{ success: boolean; message: string; data: Plot }> => {
    // Strip frontend-only fields
    const apiPayload = { ...data };
    delete apiPayload.imageUrl;

    const response = await api.put(`/plot/${id}`, apiPayload);

    // Attach the image locally
    if (response.data?.success && data.imageUrl && response.data.data) {
      response.data.data.imageUrl = data.imageUrl;
    }
    return response.data;
  },

  /**
   * Soft delete a plot (sets isActive = false).
   */
  deletePlot: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/plot/${id}`);
    return response.data;
  },
};

export default plotService;
