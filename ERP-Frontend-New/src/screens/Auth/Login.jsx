import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Label } from '../../components/ui/Input';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = useAppStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-[#F3F3F3] mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-[#888888] text-sm">Enter your credentials to access your workspace</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="password" className="block text-[9.5px] uppercase tracking-[0.1em] text-[#888888] font-bold">Password</label>
              <a href="#" className="text-xs text-[var(--color-primary)] hover:underline">Forgot?</a>
            </div>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <Button type="submit" className="w-full mt-2">Sign In</Button>
        </form>

        <div className="mt-6 text-center text-sm text-[#888888]">
          Don't have an account? <Link to="/register" className="text-[var(--color-primary)] hover:underline">Register here</Link>
        </div>
      </Card>
    </div>
  );
};
