"use client";

import * as React from "react";
import Link from "next/link";

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { cn } from "@/lib/utils";
import {
    ConnectWallet,
    Wallet,
    WalletDropdown,
    WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Address, Avatar, Identity, Name } from "@coinbase/onchainkit/identity";

const components: { title: string; href: string; description: string }[] = [
    {
        title: "Create Project",
        href: "/create-project",
        description:
            "Create a project and start receiving funds from your supporters.",
    },
    {
        title: "Boost Project",
        href: "/boost-project",
        description:
            "Boost your project to increase visibility and attract more supporters.",
    },
];

export default function Navbar() {
    return (
        <div className="bg-bg w-screen">
            <NavigationMenu className="z-[5] m750:max-w-[300px] mx-auto">
                <NavigationMenuList className="m750:max-w-[300px]">
                    <NavigationMenuItem>
                        <Link href="/" legacyBehavior passHref>
                            <NavigationMenuLink
                                className={navigationMenuTriggerStyle()}
                            >
                                <span className="m750:max-w-[80px] m750:text-xs">
                                    fundl.us
                                </span>
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href="/projects" legacyBehavior passHref>
                            <NavigationMenuLink
                                className={navigationMenuTriggerStyle()}
                            >
                                <span className="m750:max-w-[80px] m750:text-xs">
                                    View Projects
                                </span>
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger className="m750:max-w-[80px] m750:text-xs">
                            Creators
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] lg:w-[600px] ">
                                {components.map((component) => (
                                    <ListItem
                                        key={component.title}
                                        title={component.title}
                                        href={component.href}
                                    >
                                        {component.description}
                                    </ListItem>
                                ))}
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Wallet>
                            <div className="inline-flex items-center justify-center whitespace-nowrap rounded-base text-sm font-base ring-offset-white transition-all gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-bw text-text border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-non">
                                <ConnectWallet className="bg-inherit hover:bg-inherit">
                                    <Avatar className="h-6 w-6" />
                                    <Name className="text-black" />
                                </ConnectWallet>
                            </div>
                            <WalletDropdown>
                                <Identity
                                    className="px-4 pt-3 pb-2"
                                    hasCopyAddressOnClick
                                >
                                    <Avatar />
                                    <Name />
                                    <Address />
                                </Identity>
                                <WalletDropdownDisconnect />
                            </WalletDropdown>
                        </Wallet>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "hover:bg-accent block text-mtext select-none space-y-1 rounded-base border-2 border-transparent p-3 leading-none no-underline outline-none transition-colors hover:border-border dark:hover:border-darkBorder",
                        className
                    )}
                    {...props}
                >
                    <div className="text-base font-heading leading-none">
                        {title}
                    </div>
                    <p className="text-muted-foreground font-base line-clamp-2 text-sm leading-snug">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = "ListItem";
