import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Label } from '../../components/ui/Input';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';

export const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', password: '' });

  useEffect(() => {
    // mapped to GET /api/invites/validate/:token
    setTimeout(() => {
      setValid(true);
      setLoading(false);
    }, 1000); // Mocking validation
  }, [token]);

  const handleAccept = async (e) => {
    e.preventDefault();
    try {
      // await api.post(`/invites/accept/${token}`, formData);
      console.log('Accepting invite...', formData, token);
      navigate('/login');
    } catch (err) {
      alert('Accepting invite failed');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Verifying identity...</div>;
  if (!valid) return <div className="min-h-screen flex items-center justify-center text-[var(--color-danger)]">Invalid or expired token</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-[#F3F3F3] mb-2 tracking-tight">Accept Invite</h1>
          <p className="text-[#888888] text-sm">Complete your profile to join</p>
        </div>

        <form onSubmit={handleAccept} className="space-y-6">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" type="text" placeholder="John Doe" 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required 
            />
          </div>
          <div>
            <Label htmlFor="password">Create Password</Label>
            <Input 
              id="password" type="password" placeholder="••••••••" 
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required 
            />
          </div>
          <Button type="submit" className="w-full mt-2">Join Workspace</Button>
        </form>
      </Card>
    </div>
  );
};
