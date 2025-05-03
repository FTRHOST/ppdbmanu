'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

// Mock user data structure
interface AuthUser {
    name: string;
    username: string;
    isAdmin: boolean;
}

// Mock Petugas data structure
interface PetugasAccount {
    nama: string;
    username: string;
    password: string; // Insecure - for mock only
    isAdmin: boolean;
}

export const useAuth = () => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true); // Start loading initially
    const router = useRouter();
    const pathname = usePathname();

    // Check auth state function
    const checkAuthState = useCallback(async () => {
        console.log("Checking auth state...");
        setLoading(true); // Start loading
        let parsedUser: AuthUser | null = null;
        try {
            await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async check
            const storedUser = localStorage.getItem('mockUser');
            if (storedUser) {
                parsedUser = JSON.parse(storedUser);
                console.log("User found in storage:", parsedUser);
            } else {
                console.log("No user found in storage.");
            }
        } catch (e) {
            console.error("Error reading auth state:", e);
            localStorage.removeItem('mockUser'); // Clear potentially corrupt data
        } finally {
            setUser(parsedUser);
            setLoading(false); // Finish loading *after* setting user state
            console.log("Auth check complete. Loading:", false, "User:", parsedUser);
        }
    }, []); // No dependencies, runs once on hook mount

    // Effect to run the check on mount
    useEffect(() => {
        checkAuthState();
    }, [checkAuthState]); // Depend on the stable checkAuthState function

    // Effect to handle redirection *after* loading is complete
    useEffect(() => {
        if (!loading) { // Only run redirect logic when loading is finished
            const isAdminPath = pathname?.startsWith('/admin');
            const isLoginPage = pathname === '/login';

            console.log(`Redirect check: loading=${loading}, user=${!!user}, isAdminPath=${isAdminPath}, isLoginPage=${isLoginPage}`);

            if (!user && isAdminPath && !isLoginPage) {
                console.log("Redirecting to login (user null, admin path, not login page).");
                router.push('/login');
            } else if (user && isLoginPage) {
                 console.log("Redirecting to admin (user exists, on login page).");
                 router.push('/admin'); // Redirect logged-in users away from login page
            }
        }
    }, [loading, user, pathname, router]); // Rerun when loading state, user, or path changes

    const login = useCallback(async (username: string, password: string): Promise<boolean> => {
        setLoading(true);
        console.log("Attempting login with:", username);
        await new Promise(resolve => setTimeout(resolve, 500));

        let loggedInUser: AuthUser | null = null;
        let success = false;

        // Check admin
        if (username.toLowerCase() === 'admin' && password === 'password') {
            loggedInUser = { name: "Admin Utama", username: "admin", isAdmin: true };
            success = true;
        } else {
            // Check petugas
            const storedPetugas = localStorage.getItem('petugasAccounts');
            let petugasList: PetugasAccount[] = [];
            if (storedPetugas) {
                try { petugasList = JSON.parse(storedPetugas); } catch (e) { console.error("Error parsing petugas accounts:", e); }
            }
            const foundPetugas = petugasList.find(p => p.username.toLowerCase() === username.toLowerCase());
            if (foundPetugas && foundPetugas.password === password) {
                loggedInUser = { name: foundPetugas.nama, username: foundPetugas.username, isAdmin: foundPetugas.isAdmin };
                success = true;
            }
        }

        if (success && loggedInUser) {
            console.log("Login successful:", loggedInUser);
            setUser(loggedInUser);
            localStorage.setItem('mockUser', JSON.stringify(loggedInUser));
        } else {
            console.log("Login failed: Invalid credentials");
            toast({
                title: "Login Gagal",
                description: "Username atau password salah.",
                variant: "destructive",
            });
            setUser(null);
            localStorage.removeItem('mockUser');
        }

        setLoading(false);
        return success;

    }, []);

    const logout = useCallback(async () => {
        setLoading(true);
        console.log("Logging out...");
        await new Promise(resolve => setTimeout(resolve, 300));
        setUser(null);
        localStorage.removeItem('mockUser');
        setLoading(false);
        console.log("Logout complete, redirecting to login.");
        router.push('/login');
    }, [router]);

    const requireAuth = useCallback(() => {
        // This function might not be strictly necessary anymore if the redirect effect works correctly,
        // but can be kept as a potential explicit check within component logic if needed.
        if (!loading && !user && pathname?.startsWith('/admin') && pathname !== '/login') {
            console.log("RequireAuth triggered: Redirecting to login.");
            router.push('/login');
        }
    }, [loading, user, pathname, router]);

    const updateUserProfile = useCallback(async (newName: string, newUsername: string): Promise<boolean> => {
        setLoading(true);
        console.log("Attempting to update profile:", { newName, newUsername });
        await new Promise(resolve => setTimeout(resolve, 700));

        if (!user) { setLoading(false); return false; }

        // Check if new username is taken (excluding current user)
        const storedPetugas = localStorage.getItem('petugasAccounts');
        let petugasList: PetugasAccount[] = [];
        if (storedPetugas) {
            try { petugasList = JSON.parse(storedPetugas); } catch (e) { console.error("Error parsing petugas list for update check:", e); }
        }
        const usernameTaken = (newUsername.toLowerCase() === 'admin' && user.username.toLowerCase() !== 'admin') ||
                              petugasList.some(p => p.username.toLowerCase() === newUsername.toLowerCase() && p.username.toLowerCase() !== user.username.toLowerCase());

        if (usernameTaken) {
             toast({ title: "Update Gagal", description: "Username sudah digunakan.", variant: "destructive" });
             setLoading(false);
             return false;
        }

        // Update user state
        const updatedUser = { ...user, name: newName, username: newUsername };
        setUser(updatedUser);
        localStorage.setItem('mockUser', JSON.stringify(updatedUser));

         // Update petugas list if the user being updated is a petugas
         if (!user.isAdmin) {
            const updatedPetugasList = petugasList.map(p =>
                p.username.toLowerCase() === user.username.toLowerCase() // Find the original username
                 ? { ...p, username: newUsername, nama: newName } // Update name and username
                 : p
            );
            localStorage.setItem('petugasAccounts', JSON.stringify(updatedPetugasList));
         }

        console.log("Profile updated locally:", updatedUser);
        setLoading(false);
        return true;

    }, [user]);

    const changeUserPassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
        setLoading(true);
        console.log("Attempting to change password...");
        await new Promise(resolve => setTimeout(resolve, 700));

         if (!user) { setLoading(false); return false; }

         let correctCurrentPassword = false;

         // Check admin password
         if (user.isAdmin && user.username.toLowerCase() === 'admin' && currentPassword === 'password') {
             correctCurrentPassword = true;
             // NOTE: In a real app, you'd update the admin password source here.
             console.log("Password changed successfully for admin (mock).");
         } else if (!user.isAdmin) {
             // Check petugas password
             const storedPetugas = localStorage.getItem('petugasAccounts');
             let petugasList: PetugasAccount[] = [];
              if (storedPetugas) {
                  try { petugasList = JSON.parse(storedPetugas); } catch (e) { console.error("Error parsing petugas list for password check:", e); }
              }
              const foundPetugasIndex = petugasList.findIndex(p => p.username.toLowerCase() === user.username.toLowerCase());

              if (foundPetugasIndex !== -1 && petugasList[foundPetugasIndex].password === currentPassword) {
                  correctCurrentPassword = true;
                  // Update the password in the list
                  petugasList[foundPetugasIndex].password = newPassword;
                  localStorage.setItem('petugasAccounts', JSON.stringify(petugasList));
                  console.log("Password changed successfully for petugas (mock).");
              }
         }

        setLoading(false);
        if (!correctCurrentPassword) {
             toast({ title: "Gagal", description: "Password saat ini salah.", variant: "destructive" });
             return false;
        }

        return true;
    }, [user]);

    return { user, loading, login, logout, requireAuth, updateUserProfile, changeUserPassword };
};