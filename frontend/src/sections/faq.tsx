import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import Marquee from "react-fast-marquee";

export default function Faq() {
    return (
        <div>
            <section className=" dark:bg-darkBg bg-bg py-20 font-base lg:py-[100px]">
                <h2 className="mb-14 px-5 text-center text-2xl font-heading md:text-3xl lg:mb-20 lg:text-4xl">
                    Frequently asked questions
                </h2>

                <div className="mx-auto grid w-[700px] max-w-full px-5">
                    <Accordion
                        className="text-base sm:text-lg"
                        type="single"
                        collapsible
                    >
                        <AccordionItem className="mb-2" value="item-1">
                            <AccordionTrigger>
                                🛠️ How do I create a project?
                            </AccordionTrigger>
                            <AccordionContent>
                                To launch a project, click &quot;Create
                                Project&quot; and provide the following:
                                {
                                    <ul className="list-disc list-inside">
                                        <li>Your funding goal</li>
                                        <li>
                                            The ERC20 token you want to receive
                                        </li>
                                        <li>The end date of your campaign</li>
                                        <li>
                                            A clear description and purpose for
                                            your project
                                        </li>
                                        <li>
                                            Once submitted, your project will be
                                            published and open for funding.
                                        </li>
                                    </ul>
                                }
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem className="mb-2" value="item-2">
                            <AccordionTrigger>
                                💸 How does funding work?
                            </AccordionTrigger>
                            <AccordionContent>
                                Supporters can fund your project using the ERC20
                                token you specified. Funds aren&apos;t released
                                all at once—they&apos;re streamed gradually to
                                ensure accountability and alignment with
                                milestones.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem className="mb-2" value="item-3">
                            <AccordionTrigger>
                                🚀 What is Boosting?
                            </AccordionTrigger>
                            <AccordionContent>
                                Boosting is a paid feature that increases your
                                project&apos;s visibility on the platform.
                                Projects with Boost appear in featured sections,
                                get highlighted badges, and attract more
                                attention from the community.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>
                                🗳️ How do refunds work?
                            </AccordionTrigger>
                            <AccordionContent>
                                If backers feel a project is inactive or
                                off-track, they can initiate a community vote to
                                halt the payment stream. If the vote passes, the
                                stream is stopped, and remaining funds are
                                refunded to the supporters proportionally.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </section>
            <div>
                <Marquee
                    className="border-y-border dark:border-y-darkBorder dark:border-darkBorder dark:bg-secondaryBlack border-y-2 bg-white py-3 font-base sm:py-5"
                    direction="right"
                >
                    {Array(10)
                        .fill("xd")
                        .map((x, id) => {
                            return (
                                <div className="flex items-center" key={id}>
                                    <span className="mx-8 text-xl font-heading sm:text-2xl lg:text-4xl">
                                        FUNDL NOW
                                    </span>
                                </div>
                            );
                        })}
                </Marquee>
            </div>
        </div>
    );
}
