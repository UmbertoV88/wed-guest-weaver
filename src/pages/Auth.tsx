import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import CommonHeader from '@/components/CommonHeader';
import { signInSchema, signUpSchema, SignInInput, SignUpInput } from '@/schemas/authSchema';
import { Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin';

  const {
    register: registerSignIn,
    handleSubmit: handleSubmitSignIn,
    formState: { errors: signInErrors }
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema)
  });

  const {
    register: registerSignUp,
    handleSubmit: handleSubmitSignUp,
    formState: { errors: signUpErrors },
    reset: resetSignUp
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema)
  });

  useEffect(() => {
    if (user) {
      navigate('/pricing');
    }
  }, [user, navigate]);

  const onSignIn = handleSubmitSignIn(async (data) => {
    setLoading(true);

    const { error } = await signIn(data.email, data.password);

    if (error) {
      console.error('Sign in error:', error.message);
    }

    setLoading(false);
  });

  const onSignUp = handleSubmitSignUp(async (data) => {
    setLoading(true);

    const { error } = await signUp(data.email, data.password, data.fullName);

    if (error) {
      console.error('Sign up error:', error.message);
    } else {
      resetSignUp();
    }

    setLoading(false);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-secondary/20">
      <CommonHeader />
      <div className="flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <p className="text-gray-600">Accedi per gestire la lista degli invitati</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Accesso Sicuro</CardTitle>
              <CardDescription>
                Accedi al tuo account per gestire gli invitati del matrimonio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Accedi</TabsTrigger>
                  <TabsTrigger value="signup">Registrati</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={onSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        {...registerSignIn("email")}
                        id="signin-email"
                        type="email"
                        placeholder="tua@email.com"
                        className={signInErrors.email ? "border-destructive" : ""}
                      />
                      {signInErrors.email && (
                        <p className="text-destructive text-sm">{signInErrors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Input
                          {...registerSignIn("password")}
                          id="signin-password"
                          type={showSignInPassword ? "text" : "password"}
                          placeholder="La tua password"
                          className={`pr-10 ${signInErrors.password ? "border-destructive" : ""}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignInPassword(!showSignInPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showSignInPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {signInErrors.password && (
                        <p className="text-destructive text-sm">{signInErrors.password.message}</p>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Accesso in corso..." : "Accedi"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={onSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nome completo</Label>
                      <Input
                        {...registerSignUp("fullName")}
                        id="signup-name"
                        type="text"
                        placeholder="Il tuo nome completo"
                        className={signUpErrors.fullName ? "border-destructive" : ""}
                      />
                      {signUpErrors.fullName && (
                        <p className="text-destructive text-sm">{signUpErrors.fullName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        {...registerSignUp("email")}
                        id="signup-email"
                        type="email"
                        placeholder="tua@email.com"
                        className={signUpErrors.email ? "border-destructive" : ""}
                      />
                      {signUpErrors.email && (
                        <p className="text-destructive text-sm">{signUpErrors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          {...registerSignUp("password")}
                          id="signup-password"
                          type={showSignUpPassword ? "text" : "password"}
                          placeholder="Crea una password (min. 8 caratteri)"
                          className={`pr-10 ${signUpErrors.password ? "border-destructive" : ""}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showSignUpPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {signUpErrors.password && (
                        <p className="text-destructive text-sm">{signUpErrors.password.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        La password deve contenere almeno 8 caratteri, una maiuscola, una minuscola, un numero e un carattere speciale
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Registrazione in corso..." : "Registrati"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="text-center mt-6 space-y-2">
            <p className="text-xs text-gray-500">
              I tuoi dati sono protetti e sicuri. Solo gli organizzatori del matrimonio possono accedere alle informazioni degli invitati.
            </p>
            <Link
              to="/"
              className="inline-block text-sm text-primary hover:text-primary-deep transition-colors"
            >
              Scopri di più sul nostro Wedding Planner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;