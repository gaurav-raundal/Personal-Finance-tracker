
import { useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions, Transaction } from "@/contexts/TransactionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowDownCircle, ArrowUpCircle, Plus, Search } from "lucide-react";
import { format } from "date-fns";

// Define form schema
const transactionSchema = z.object({
  amount: z.string().min(1, { message: "Amount is required" }).refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "Amount must be a positive number" }
  ),
  type: z.enum(["income", "expense"], {
    required_error: "Transaction type is required",
  }),
  category: z.string().min(1, { message: "Category is required" }),
  description: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

const incomeCategories = ["Salary", "Freelance", "Investments", "Gift", "Other"];
const expenseCategories = ["Food", "Transport", "Entertainment", "Bills", "Shopping", "Rent", "Education", "Health", "Other"];

const Transactions = () => {
  const { user } = useAuth();
  const { addTransaction, getUserTransactions } = useTransactions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  
  const userTransactions = getUserTransactions(user?.id || "");
  
  // Filtered transactions
  const filteredTransactions = userTransactions.filter((transaction) => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      filterType === "all" || transaction.type === filterType;
    
    return matchesSearch && matchesType;
  });
  
  // Initialize form
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: "",
      type: "expense",
      category: "",
      description: "",
    },
  });
  
  // Watch for transaction type changes
  const transactionType = form.watch("type");

  const onSubmit = (data: TransactionFormValues) => {
    addTransaction({
      amount: Number(data.amount),
      type: data.type,
      category: data.category,
      description: data.description || "",
    });
    
    form.reset();
    setIsDialogOpen(false);
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
              <DialogDescription>
                Enter the details of your transaction.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (₹)</FormLabel>
                      <FormControl>
                        <Input placeholder="1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select transaction type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>
                              {transactionType === "income" ? "Income" : "Expense"} Categories
                            </SelectLabel>
                            {(transactionType === "income" ? incomeCategories : expenseCategories).map(
                              (category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              )
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Transaction details" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Add Transaction</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>Manage all your financial transactions</CardDescription>
          
          <div className="mt-4 flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select 
              value={filterType} 
              onValueChange={(value: "all" | "income" | "expense") => setFilterType(value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction: Transaction) => (
                <div key={transaction.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${transaction.type === 'income' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                      {transaction.type === 'income' ? <ArrowUpCircle className="h-5 w-5" /> : <ArrowDownCircle className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.category}</p>
                      <p className="text-sm text-muted-foreground">{transaction.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                      {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), 'dd MMM yyyy, h:mm a')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <p>No transactions found</p>
                {userTransactions.length === 0 ? (
                  <Button
                    variant="link"
                    onClick={() => setIsDialogOpen(true)}
                    className="mt-2"
                  >
                    Add your first transaction
                  </Button>
                ) : (
                  <p className="mt-2 text-sm">Try changing your search or filter</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Transactions;
