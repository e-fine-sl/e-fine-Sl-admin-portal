'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
    const { login, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [totpToken, setTotpToken] = useState('');
    const [showTwoFactor, setShowTwoFactor] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await login({ email, password }, showTwoFactor ? totpToken : undefined);

            if (result && typeof result === 'object' && 'requireTwoFactor' in result && result.requireTwoFactor) {
                setShowTwoFactor(true);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/banner.png"
                    alt="Traffic Management Background"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/50" />
            </div>

            <Card className="w-full max-w-md shadow-lg relative z-10 bg-white/95 backdrop-blur-sm">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                        {showTwoFactor ? (
                            <Lock className="h-8 w-8 text-blue-600" />
                        ) : (
                            <Shield className="h-8 w-8 text-blue-600" />
                        )}
                    </div>
                    <CardTitle className="text-2xl font-bold text-blue-900">
                        {showTwoFactor ? 'Two-Factor Authentication' : 'Admin Portal Login'}
                    </CardTitle>
                    <CardDescription>
                        {showTwoFactor
                            ? 'Enter the 6-digit code from your authenticator app'
                            : 'Sign in to access the e-Fine SL dashboard'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!showTwoFactor ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@efine-sl.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={isSubmitting}
                                            className="pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-gray-500" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-500" />
                                            )}
                                            <span className="sr-only">
                                                {showPassword ? 'Hide password' : 'Show password'}
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <Label htmlFor="totp">Authentication Code</Label>
                                <div className="relative">
                                    <Input
                                        id="totp"
                                        type="text"
                                        placeholder="000000"
                                        value={totpToken}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                            if (val.length <= 6) setTotpToken(val);
                                        }}
                                        className="text-center text-2xl tracking-widest"
                                        maxLength={6}
                                        autoFocus
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <p className="text-xs text-center text-gray-500">
                                    Open your Google Authenticator or Authy app
                                </p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={isSubmitting || loading}
                        >
                            {isSubmitting ? 'Verifying...' : (showTwoFactor ? 'Verify Login' : 'Sign In')}
                        </Button>

                        {showTwoFactor && (
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full text-sm text-gray-500"
                                onClick={() => {
                                    setShowTwoFactor(false);
                                    setTotpToken('');
                                }}
                            >
                                Back to Login
                            </Button>
                        )}
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t py-4">
                    <p className="text-xs text-gray-500">
                        &copy; {new Date().getFullYear()} Sri Lanka Police Traffic Division
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
