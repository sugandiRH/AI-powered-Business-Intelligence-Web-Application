export const registerValidation = {

    name: {
        required: "Full name is required",
        minLength: {
        value: 10,
        message: "Full name must be at least 10 characters",
        },
    },

    businessType: {
        required: "Business type is required",
        validate: (value) =>
            ["retail", "clothing", "restaurant"].includes(value) ||
            "Invalid business type",
    },


    email: {
        required: "Email is required",
        pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Invalid email format",
        },
    },

    password: {
        required: "Password is required",
        minLength: {
        value: 6,
        message: "Password must be at least 6 characters",
        },
    },

    confirmPassword: {
        required: "Confirm password is required",
        validate: (value) =>
            value === watch("password") || "Passwords do not match",
    },
};
