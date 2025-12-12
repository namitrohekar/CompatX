import axiosClient from "../lib/axiosClient";

const profileService = {
 
// Users Profile Apis
  getMyProfile: async () => {
    try {
      const response = await axiosClient.get("/user/profile");
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to fetch profile",
      };
    }
  },

  createOrUpdateMyProfile: async (profileData) => {
    try {
      const response = await axiosClient.post(
        "/user/profile",
        profileData
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to create or update profile",
      };
    }
  },

  updateMyProfile: async (profileData) => {
    try {
      const response = await axiosClient.put(
        "/user/profile",
        profileData
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to update profile",
      };
    }
  },

  deleteMyProfile: async () => {
    try {
      const response = await axiosClient.delete("/user/profile");
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to delete profile",
      };
    }
  },

  
  // Admin Profile APIs

  getAllProfiles: async (page = 0, size = 10) => {
    try {
      const response = await axiosClient.get(
        `/admin/profiles?page=${page}&size=${size}`
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to fetch profiles",
      };
    }
  },

  //  ADMIN GET BY USER ID (not profileId)
  getProfileByUserId: async (userId) => {
    try {
      const response = await axiosClient.get(
        `/admin/profiles/user/${userId}`
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch profile by userId",
      };
    }
  },

  // ADMIN UPDATE BY USER ID
  adminUpdateProfile: async (userId, profileData) => {
    try {
      const response = await axiosClient.put(
        `/admin/profiles/user/${userId}`,
        profileData
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to update profile by admin",
      };
    }
  },

  //  ADMIN DELETE BY USER ID
  adminDeleteProfile: async (userId) => {
    try {
      const response = await axiosClient.delete(
        `/admin/profiles/user/${userId}`
      );
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to delete profile by admin",
      };
    }
  },

  getProfileStats: async () => {
    try {
      const response = await axiosClient.get(
        "/admin/profiles/stats"
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch profile statistics",
      };
    }
  },
};

export default profileService;
