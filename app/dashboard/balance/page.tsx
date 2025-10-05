'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Wallet, CreditCard, TrendingUp } from 'lucide-react';

export default function Balance() {
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState('50');
  const [customAmount, setCustomAmount] = useState('');
  const currentBalance = 125.50;

  const handleTopUp = () => {
    const amount = selectedAmount === 'custom' ? customAmount : selectedAmount;
    toast({
      title: 'Success',
      description: `$${amount} added to your balance`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Balance & Billing</h1>
        <p className="text-muted-foreground">Manage your account balance and top-up</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${currentBalance.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$42.30</p>
            <p className="text-xs text-muted-foreground mt-1">Total spent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Credits Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">8,450</p>
            <p className="text-xs text-muted-foreground mt-1">API calls</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Up Balance</CardTitle>
          <CardDescription>Add credits to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Select Amount</Label>
            <RadioGroup value={selectedAmount} onValueChange={setSelectedAmount}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['10', '50', '100', '200'].map((amount) => (
                  <div key={amount} className="relative">
                    <RadioGroupItem
                      value={amount}
                      id={`amount-${amount}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`amount-${amount}`}
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span className="text-2xl font-bold">${amount}</span>
                    </Label>
                  </div>
                ))}
              </div>
              <div className="relative">
                <RadioGroupItem
                  value="custom"
                  id="amount-custom"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="amount-custom"
                  className="flex items-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <span className="mr-4">Custom Amount:</span>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount('custom');
                    }}
                    className="flex-1 text-foreground bg-background"
                    min="5"
                    onClick={(e) => e.stopPropagation()}
                  />
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <div className="border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5" />
                <div>
                  <p className="font-medium">NowPayments</p>
                  <p className="text-sm text-muted-foreground">Pay with 150+ cryptocurrencies</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Pay with Crypto</Button>
            </div>
          </div>

          <Button onClick={handleTopUp} size="lg" className="w-full">
            Top Up ${selectedAmount === 'custom' ? customAmount || '0' : selectedAmount}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent balance changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: '2025-01-15', description: 'API Usage', amount: -12.50, type: 'debit' },
              { date: '2025-01-10', description: 'Top Up', amount: 50.00, type: 'credit' },
              { date: '2025-01-08', description: 'API Usage', amount: -8.20, type: 'debit' },
              { date: '2025-01-05', description: 'Top Up', amount: 100.00, type: 'credit' },
            ].map((transaction, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b last:border-0">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">{transaction.date}</p>
                </div>
                <p className={`font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'credit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}