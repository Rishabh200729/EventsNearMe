'use client';
import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
    label: string;
    loading: React.ReactNode;
};

const Button = ({ label,loading } : SubmitButtonProps) => {
    const { pending } = useFormStatus();
    return (
        <div>
            <button disabled = {pending}  type="submit" className="block bg-green-300 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full px-2.5 py-1">{ pending ? loading : label }</button>
        </div>
    )
}
export default Button;