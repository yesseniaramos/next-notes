"use client";

import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { logOutAction } from '@/actions/users';

function LogOutButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        
        setLoading(true);

        const { errorMessage } = await logOutAction();

        if (!errorMessage) {
            toast.success("Successfully logged out",{
                description:" You have been successfullylogged out."
            });
            router.push("/");
        }
        else {
            toast.error(`Error logging out: ${errorMessage}`)
        }
        setLoading(false);
    }

    return (
        <Button 
        variant="outline" 
        onClick={ handleLogout}
        disabled ={ loading }
        className='w-24'>
            {loading ? <Loader2 className='animate-spin' /> : "Log Out"}
        </Button>
    )
}

export default LogOutButton