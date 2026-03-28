import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Label } from '../../components/ui/Input';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';

export const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // await api.post('/auth/register', formData);
      console.log('Registering...', formData);
      navigate('/login');
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-[#F3F3F3] mb-2 tracking-tight">Create Account</h1>
          <p className="text-[#888888] text-sm">Join the InvoiceMate Workspace</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" type="text" placeholder="John Doe" 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required 
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" type="email" placeholder="you@company.com" 
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required 
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" type="password" placeholder="••••••••" 
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required 
            />
          </div>

          <Button type="submit" className="w-full mt-2">Sign Up</Button>
        </form>

        <div className="mt-6 text-center text-sm text-[#888888]">
          Already have an account? <Link to="/login" className="text-[var(--color-primary)] hover:underline">Log in</Link>
        </div>
      </Card>
    </div>
  );
};
