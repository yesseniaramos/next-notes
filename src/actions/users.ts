"use server";

import { createClient } from "@/auth/server";
import { prisma } from "@/db/prisma";
import { handleError } from "@/lib/utils";

export const loginAction = async (email: string, password: string) => {
    try { 
        const { auth } = await createClient();

        const { error } = await auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        return { errorMessage: null };
    } catch(error) { 
        return handleError(error);
    }
}

export const logOutAction = async () => {
    try { 
        const { auth } = await createClient();

        const { error } = await auth.signOut();

        if (error) throw error;

        return { errorMessage: null };
    } catch(error) { 
        return handleError(error);
    }
}

export const signUpAction = async (email: string, password: string) => {
    try { 
        const { auth } = await createClient();

        const { data, error } = await auth.signUp({
            email,
            password,
        });
        if (error) throw error;

        const userId = data.user?.id;
        if(!userId) throw new Error("Error signing up");

        // add user to database
        try {
            await prisma.user.create({
                data: {
                    id: userId,
                    email: email,
                },
            });
        } catch (dbError) {
            if (dbError instanceof Error && dbError.message.includes("Unique constraint failed")) {
                console.error("Sign-up DB error:", dbError);
                return { errorMessage: "There's a problem, please verify your email" };
            }
            throw dbError;
        }

        return { errorMessage: null };
    } catch(error) {
        return handleError(error);
    }
}