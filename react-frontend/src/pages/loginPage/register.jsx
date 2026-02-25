import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

import { useState } from 'react';
import api from '../../services/api';

// validation
import { useForm } from "react-hook-form";
import { registerValidation } from "../../validation/registerSchema";

function Register() {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");

    //connect with backend
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        businessType: "",
        password: "",
        password_confirmation: "",
    });

    // validation
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        // console.log(data);
        try {
            const res = await api.post("/auth/register", {
            name: data.fullName,
            email: data.email,
            business_type: data.businessType,
            password: data.password,
            password_confirmation: data.confirmPassword,
            });

            localStorage.setItem("token", res.data.token);
            window.location.href = "/register";

            // alert("Registered successfully");
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 
                "Please try again."
            );
        }
    };
    const closeError = () => {
        setErrorMessage("");
    };

    const password = watch("password");

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
            <div className="flex min-h-full flex-col justify-center px-6 py-5 lg:px-8 mb-10">
                <div className='w-auto sm:w-150 mx-auto my-20
                    bg-slate-900/50 backdrop-blur-sm border rounded-xl sm:rounded-2xl p-10 sm:p-10 
                     h-full border-blue-500 shadow-2xl shadow-blue-500/20 lg:scale-105'>
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                        <div className="flex items-center group justify-center">
                            <div>
                                <img src={logo} 
                                alt="DataTalk Logo" 
                                className=" h-10 mx-auto w-auto"/>
                            </div>

                            <span className="text-sm font-medium">
                                <span className="text-white">Data</span>
                                <span className="text-blue-400">Talk</span>
                            </span>
                        </div>
                        <h2 className="text-center text-2xl/9 font-bold tracking-tight">Sign up for your account</h2>

                        {/* display error message */}
                        {errorMessage && (
                            <div className="mt-4 flex items-center justify-between bg-red-500/10 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm">
                                <span>{errorMessage}</span>
                                <button 
                                    onClick={closeError}
                                    className="ml-4 text-red-300 hover:text-white font-bold"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm ">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label htmlFor="full-name" className="block text-sm/6 font-medium text-gray-100">Full Name</label>
                                <div className="mt-2">
                                    <input
                                        id="full-name"
                                        {...register("fullName", registerValidation.name)}
                                        className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
                                        
                                    />
                                </div>
                                {errors.fullName && (
                                    <p className="text-red-400 text-[11px] mt-1">
                                        {errors.fullName.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-100">Email address</label>
                                <div className="mt-2">
                                    <input
                                        id="email"
                                        {...register("email", registerValidation.email)}
                                        className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
                                        
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-400 text-[11px] mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* get data from database */}
                            <div>
                                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-100">Bussiness Type</label>
                                <div className="mt-2">
                                    <select 
                                    id="business-type" 
                                    {...register("businessType", registerValidation.businessType)}
                                    className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6" 
                                    >
                                        <option className='text-gray-400' value="" disabled>Select Business Type</option>
                                        <option className='text-gray-400' value="retail">Retail</option>
                                    </select>
                                </div>
                                {errors.businessType && (
                                    <p className="text-red-400 text-[11px] mt-1">
                                        {errors.businessType.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-100">Password</label>   
                                
                                <div className="mt-2">
                                    <input
                                        id="password"
                                        type="password"
                                        {...register("password", registerValidation.password)}
                                        className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
                                        
                                   />
                                </div>
                                {errors.password && (
                                    <p className="text-red-400 text-[11px] mt-1">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="confirm-password" className="block text-sm/6 font-medium text-gray-100">Confirm Password</label>   
                                </div>
                                <div className="mt-2">
                                    <input
                                        id="confirm-password"
                                        type="password"
                                        className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
                                            

                                        {...register("confirmPassword", {
                                            required: "Confirm password is required",
                                            validate: (value) =>
                                            value === password || "Passwords do not match",
                                        })}
                                    />
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-red-400 text-[11px] mt-1">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <input type="submit" 
                                className="flex w-full justify-center rounded-md bg-blue-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500" value="Sign up"/> 
                            </div>
                        </form>

                        <p className="mt-10 text-center text-sm/6 text-gray-400">
                            Already have an account?
                            <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300">Sign In</Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>    
    );
}

export default Register;