import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Copy, Trash2 } from 'lucide-react';

interface Token {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
}

const ApiTokens = () => {
  const { toast } = useToast();
  const [tokens, setTokens] = useState<Token[]>([
    {
      id: '1',
      name: 'Production API',
      key: 'sk_live_abc123...',
      created: '2025-01-10',
      lastUsed: '2025-01-15',
    },
  ]);
  const [newTokenName, setNewTokenName] = useState('');
  const [showNewToken, setShowNewToken] = useState(false);

  const handleCreateToken = () => {
    if (!newTokenName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a token name',
        variant: 'destructive',
      });
      return;
    }

    const newToken: Token = {
      id: Date.now().toString(),
      name: newTokenName,
      key: `sk_live_${Math.random().toString(36).substring(2, 15)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
    };

    setTokens([...tokens, newToken]);
    setNewTokenName('');
    setShowNewToken(false);
    toast({
      title: 'Success',
      description: 'API token created successfully',
    });
  };

  const handleCopyToken = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: 'Copied',
      description: 'Token copied to clipboard',
    });
  };

  const handleDeleteToken = (id: string) => {
    setTokens(tokens.filter(t => t.id !== id));
    toast({
      title: 'Success',
      description: 'Token deleted successfully',
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">API Tokens</h1>
          <p className="text-muted-foreground">Manage your API keys and monitor usage</p>
        </div>
        <Button onClick={() => setShowNewToken(!showNewToken)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Token
        </Button>
      </div>

      {showNewToken && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Token</CardTitle>
            <CardDescription>Generate a new API key for your application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tokenName">Token Name</Label>
              <Input
                id="tokenName"
                placeholder="e.g., Production API"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateToken}>Create Token</Button>
              <Button variant="outline" onClick={() => setShowNewToken(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your API Tokens</CardTitle>
          <CardDescription>Keep your tokens secure and never share them publicly</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token) => (
                <TableRow key={token.id}>
                  <TableCell className="font-medium">{token.name}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{token.key}</code>
                  </TableCell>
                  <TableCell>{token.created}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{token.lastUsed}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => handleCopyToken(token.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => handleDeleteToken(token.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Usage</CardTitle>
          <CardDescription>Monitor your API consumption</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Requests Today</p>
              <p className="text-3xl font-bold">1,234</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Requests This Month</p>
              <p className="text-3xl font-bold">45,678</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-3xl font-bold">99.8%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTokens;
