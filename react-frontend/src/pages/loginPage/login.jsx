import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

// for form validation, use react-hook-form
import { useForm } from "react-hook-form";
import { loginValidation } from "../../validation/loginSchema";


function Login() {

    // validation
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        console.log(data);
    };



    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
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
                        <h2 className="text-center text-2xl/9 font-bold tracking-tight text-white">Welcome Back</h2>
                    </div>

                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <div>
                            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-100">Email address</label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    {...register("email", loginValidation.email)}
                                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-400 text-[11px] mt-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-100">Password</label>
                            <div className="text-sm">
                                <a href="#" className="font-semibold text-blue-400 hover:text-blue-300">Forgot password?</a>
                            </div>
                            </div>

                            <div className="mt-2">
                                <input
                                    id="password"
                                    type="password"
                                    {...register("password", loginValidation.password)}
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
                            <input type="submit" className="flex w-full justify-center rounded-md bg-blue-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500" value="Sign in"/>
                        </div>
                        </form>

                        <p className="mt-10 text-center text-sm/6 text-gray-400">
                        Not a member?
                        <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300">Sign up</Link>
                        </p>
                    </div>
                </div>    
            </div>
        </div>    
    );
}

export default Login;