"use client";

import React from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

import { format } from "date-fns"
import { Calendar as CalendarIcon, PlusCircle } from "lucide-react"
 
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useRouter } from "next/navigation";
import { createTransaction } from "@/lib/api";

const AddTransactions = () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [amount, setAmount] = React.useState(0.0);
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [category, setCategory] = React.useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            await createTransaction({
                title,
                amount: Number(amount),
                date,
                category,
                description,
            });
            
            // Redirect or show success message
            router.push('/');
        } catch (error) {
            console.error('Failed to create transaction:', error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
            <h1 className="text-3xl font-bold mb-1">Add Transaction</h1>
            <h2 className="text-md text-gray-400 mb-8">Record a new expense or income transaction</h2>
            <Card className="w-full max-w-xl bg-zinc-900 text-white shadow-lg rounded-xl p-6">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <PlusCircle className="text-2xl" /> Add New Transaction
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-2">
                                <label className="block text-sm font-semibold mb-1">Amount ($)</label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={amount}
                                    onChange={e => setAmount(Number(e.target.value))}
                                    placeholder="0.00"
                                    className="bg-zinc-800 text-white border-zinc-700 focus:border-white p-3"
                                />
                            </div>
                            <div className="p-2">
                                <label className="block text-sm font-semibold mb-1">Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                        data-empty={!date}
                                        className="bg-zinc-800 text-white border-zinc-700 w-full justify-start text-left font-normal p-3 data-[empty=true]:text-muted-foreground"
                                        >
                                        <CalendarIcon />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-zinc-900 text-white border-zinc-700">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            className="bg-zinc-900 text-white border-zinc-700 p-3"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div className="p-2">
                            <label className="block text-sm font-semibold mb-1">Title</label>
                            <Input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Enter transaction title"
                                className="bg-zinc-800 text-white border-zinc-700 focus:border-white p-3"
                            />
                        </div>
                        <div className="p-2">
                            <label className="block text-sm font-semibold mb-1">Description</label>
                            <Input
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Enter transaction description"
                                className="bg-zinc-800 text-white border-zinc-700 focus:border-white p-3"
                            />
                        </div>
                        <div className="p-2">
                            <label className="block text-sm font-semibold mb-1">Category</label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="bg-zinc-800 text-white border-zinc-700 focus:border-white p-3 w-full">
                                    <SelectValue placeholder="Categories" />
                                </SelectTrigger>
                                <SelectContent className="w-full min-w-[unset] border border-zinc-700 bg-zinc-900">
                                    <SelectItem value="food" className="bg-zinc-900 text-white">Food & Dining</SelectItem>
                                    <SelectItem value="home" className="bg-zinc-900 text-white">Home & Garden</SelectItem>
                                    <SelectItem value="transport" className="bg-zinc-900 text-white">Transportation</SelectItem>
                                    <SelectItem value="shopping" className="bg-zinc-900 text-white">Shopping</SelectItem>
                                    <SelectItem value="entertainment" className="bg-zinc-900 text-white">Entertainment</SelectItem>
                                    <SelectItem value="bills" className="bg-zinc-900 text-white">Bills & Utilities</SelectItem>
                                    <SelectItem value="health" className="bg-zinc-900 text-white">Health</SelectItem>
                                    <SelectItem value="travel" className="bg-zinc-900 text-white">Travel</SelectItem>
                                    <SelectItem value="education" className="bg-zinc-900 text-white">Education</SelectItem>
                                    <SelectItem value="other" className="bg-zinc-900 text-white">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="p-2">
                            <Button
                                type="submit"
                                className="bg-white text-black font-semibold px-5 py-2 rounded-md hover:bg-gray-200 transition w-full"
                            >
                                Add Transaction
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddTransactions;