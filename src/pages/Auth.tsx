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
import { useToast } from '@/hooks/use-toast';
import CommonHeader from '@/components/CommonHeader';
import { signInSchema, signUpSchema, SignInInput, SignUpInput } from '@/schemas/authSchema';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
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
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const onSignIn = handleSubmitSignIn(async (data) => {
    setLoading(true);

    const { error } = await signIn(data.email, data.password);

    if (error) {
      toast({
        title: "Errore di accesso",
        description: error.message === 'Invalid login credentials' 
          ? "Email o password non corretti" 
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Accesso effettuato!",
        description: "Benvenuto nella gestione del tuo matrimonio.",
      });
    }

    setLoading(false);
  });

  const onSignUp = handleSubmitSignUp(async (data) => {
    setLoading(true);

    const { error } = await signUp(data.email, data.password, data.fullName);

    if (error) {
      toast({
        title: "Errore di registrazione",
        description: error.message === 'User already registered' 
          ? "Utente già registrato con questa email" 
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Registrazione completata!",
        description: "Controlla la tua email per confermare l'account.",
      });
      resetSignUp();
    }

    setLoading(false);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
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
                      />
                      {signInErrors.email && (
                        <p className="text-destructive text-sm">{signInErrors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        {...registerSignIn("password")}
                        id="signin-password"
                        type="password"
                        placeholder="La tua password"
                      />
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
                      />
                      {signUpErrors.email && (
                        <p className="text-destructive text-sm">{signUpErrors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        {...registerSignUp("password")}
                        id="signup-password"
                        type="password"
                        placeholder="Crea una password (min. 8 caratteri)"
                      />
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
              className="inline-block text-sm text-rose-600 hover:text-rose-700 transition-colors"
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