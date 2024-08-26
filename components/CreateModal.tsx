"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Token } from "@/types";

const CreateModal = ({ open, setOpen, handleConfirm }: { open: boolean, setOpen: (open: boolean) => void, handleConfirm: (token1: Token, token2: Token) => void }) => {
    const [token1, setToken1] = useState<Token>({ address: "", name: "" });
    const [token2, setToken2] = useState<Token>({ address: "", name: "" });

    return (
        <Dialog
            open={open}
            onOpenChange={() => setOpen(!open)}
        >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Liquidity Pool</DialogTitle>
                    <DialogDescription>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-4 py-4">
                    <div className="flex flex-col gap-4">
                        <Label htmlFor="token1_address" className="">
                            Token 1 Address
                        </Label>
                        <Input
                            id="token1_address"
                            value={token1.address}
                            onChange={(e) => setToken1({ ...token1, address: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <Label htmlFor="token1_address" className="">
                            Token 2 Address
                        </Label>
                        <Input
                            id="token2_address"
                            value={token2.address}
                            onChange={(e) => setToken2({ ...token2, address: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <Label htmlFor="token1_address" className="">
                            Token 1 Name
                        </Label>
                        <Input
                            id="token1_name"
                            value={token1.name}
                            onChange={(e) => setToken1({ ...token1, name: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <Label htmlFor="token1_address" className="">
                            Token 2 Name
                        </Label>
                        <Input
                            id="token2_name"
                            value={token2.name}
                            onChange={(e) => setToken2({ ...token2, name: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter className="">
                    <Button
                        type="submit"
                        onClick={() => setOpen(false)}
                    >Cancel</Button>
                    <Button
                        type="submit"
                        onClick={() => handleConfirm(token1, token2)}
                    >Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateModal;