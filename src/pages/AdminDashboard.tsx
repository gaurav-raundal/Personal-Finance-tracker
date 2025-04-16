
import Layout from "@/components/Layout";
import { useTransactions } from "@/contexts/TransactionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ArrowDownCircle, ArrowUpCircle, BarChart3, IndianRupee, Search, Users } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

const AdminDashboard = () => {
  const { getAllTransactions } = useTransactions();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock users data (in a real app, you would fetch this from an API)
  const users = [
    {
      id: "1",
      name: "Admin User",
      email: "admin@example.com",
      isAdmin: true,
      createdAt: "2023-01-15T10:00:00Z",
      transactionCount: 2,
    },
    {
      id: "2",
      name: "Test User",
      email: "user@example.com",
      isAdmin: false,
      createdAt: "2023-03-20T14:30:00Z",
      transactionCount: 3,
    },
  ];
  
  const allTransactions = getAllTransactions();
  
  // Filtered users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Count totals
  const totalUsers = users.length;
  const totalTransactions = allTransactions.length;
  const totalIncome = allTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = allTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users and view all transactions
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalUsers}</div>
              <div className="rounded-full bg-primary/20 p-2 text-primary">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalTransactions}</div>
              <div className="rounded-full bg-primary/20 p-2 text-primary">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-success">
                ₹{totalIncome.toLocaleString('en-IN')}
              </div>
              <div className="rounded-full bg-success/20 p-2 text-success">
                <ArrowUpCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-destructive">
                ₹{totalExpense.toLocaleString('en-IN')}
              </div>
              <div className="rounded-full bg-destructive/20 p-2 text-destructive">
                <ArrowDownCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="transactions">All Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage users and their transactions</CardDescription>
                <div className="mt-4 relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Transactions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className={`rounded-full px-2 py-1 text-xs ${user.isAdmin ? "bg-warning/20 text-warning" : "bg-primary/20 text-primary"}`}>
                            {user.isAdmin ? "Admin" : "User"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.createdAt), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>{user.transactionCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>View all user transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {transaction.userId}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className={`mr-2 rounded-full p-1 ${transaction.type === 'income' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                              {transaction.type === 'income' ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
                            </div>
                            <span className="capitalize">{transaction.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell className={transaction.type === 'income' ? 'text-success' : 'text-destructive'}>
                          {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          {format(new Date(transaction.date), "dd MMM yyyy, h:mm a")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
