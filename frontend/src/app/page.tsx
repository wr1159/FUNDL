import Community from "@/sections/community";
import Faq from "@/sections/faq";
import Features from "@/sections/features";
import Footer from "@/sections/footer";
import Header from "@/sections/header";
import Pricing from "@/sections/pricing";

export default function Home() {
    return (
        <>
            <Header />
            <Features />
            <Community />
            <Faq />
            <Pricing />
            <Footer />
        </>
    );
}
