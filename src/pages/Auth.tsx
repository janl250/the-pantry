import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Utensils, Mail, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { z } from "zod";

export default function Auth() {
  const { t, language } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginSchema = z.object({
    email: z.string().trim().email({ message: language === 'de' ? "Ungültige E-Mail-Adresse" : "Invalid email address" }),
    password: z.string().min(6, { message: language === 'de' ? "Passwort muss mindestens 6 Zeichen lang sein" : "Password must be at least 6 characters" }),
  });

  const signupSchema = z.object({
    email: z.string().trim().email({ message: language === 'de' ? "Ungültige E-Mail-Adresse" : "Invalid email address" }),
    password: z.string().min(6, { message: language === 'de' ? "Passwort muss mindestens 6 Zeichen lang sein" : "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: language === 'de' ? "Passwort bestätigen ist erforderlich" : "Confirm password is required" }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: language === 'de' ? "Passwörter stimmen nicht überein" : "Passwords don't match",
    path: ["confirmPassword"],
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = () => {
    const schema = isLogin ? loginSchema : signupSchema;
    try {
      schema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            newErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            setErrors({ 
              general: language === 'de' 
                ? "Ungültige Anmeldedaten. Bitte überprüfen Sie E-Mail und Passwort." 
                : "Invalid login credentials. Please check your email and password."
            });
          } else {
            setErrors({ general: error.message });
          }
        } else {
          toast({
            title: t('auth.loginSuccess'),
            description: language === 'de' ? "Willkommen zurück bei The Pantry." : "Welcome back to The Pantry.",
          });
        }
      } else {
        const redirectUrl = `${window.location.origin}/`;
        
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            setErrors({ 
              general: language === 'de' 
                ? "Benutzer bereits registriert. Bitte melden Sie sich an." 
                : "User already registered. Please log in."
            });
          } else {
            setErrors({ general: error.message });
          }
        } else {
          toast({
            title: t('auth.signupSuccess'),
            description: language === 'de' 
              ? "Bitte überprüfen Sie Ihre E-Mail für die Bestätigung." 
              : "Please check your email for confirmation.",
          });
          setIsLogin(true);
        }
      }
    } catch (error) {
      setErrors({ 
        general: language === 'de' 
          ? "Ein unerwarteter Fehler ist aufgetreten." 
          : "An unexpected error occurred."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex items-center space-x-3">
              <Utensils className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">The Pantry</span>
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">
              {isLogin ? t('auth.login') : t('auth.signup')}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {isLogin 
                ? (language === 'de' ? 'Melden Sie sich bei Ihrem Konto an' : 'Log in to your account')
                : (language === 'de' ? 'Erstellen Sie Ihr neues Konto' : 'Create your new account')
              }
            </p>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <Alert variant="destructive">
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={language === 'de' ? 'ihre@email.com' : 'your@email.com'}
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-9"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-9"
                  disabled={loading}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-9"
                    disabled={loading}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading 
                ? (language === 'de' ? "Wird verarbeitet..." : "Processing...") 
                : (isLogin ? t('auth.loginButton') : t('auth.signupButton'))
              }
            </Button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              {isLogin 
                ? (language === 'de' ? "Noch kein Konto?" : "Don't have an account?") 
                : (language === 'de' ? "Bereits ein Konto?" : "Already have an account?")
              }
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ email: "", password: "", confirmPassword: "" });
                setErrors({});
              }}
              disabled={loading}
            >
              {isLogin 
                ? (language === 'de' ? "Jetzt registrieren" : "Sign up now") 
                : (language === 'de' ? "Zur Anmeldung" : "Log in")
              }
            </Button>
            
            <div className="pt-4">
              <Link to="/">
                <Button variant="outline" className="w-full">
                  {t('auth.backToHome')}
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
