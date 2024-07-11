import { loginAction } from "@/actions/login-action"

export default function Login () {
   
    return (    
        <> 
        <form action={loginAction} className="my-5">
            <div className="grid gap-2  place-content-center ">
            <h1 className="text-4xl justify-self-center">Login</h1>

                <div>
                    <label className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                    <input type="text" id="email" name="email" className="focus:outline-none border-2 border-indigo-200 border-t-indigo-500 w-full p-2.5" placeholder="abc@gmail.com" required />
                    
                </div>
                <div>
                    <label className=" mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                    <input type="text" id="password" name="password" className="focus:outline-none border-2 border-indigo-200 border-t-indigo-500  w-full p-2.5 " placeholder="Password" required />
                </div> 
            <button type="submit" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded text-sm px-2 py-2 text-center">Submit</button>
                </div>
        </form>
    </>
    )
}