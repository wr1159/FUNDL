import Marquee from "react-fast-marquee";

export default function Features() {


  const features = [ { title: "Create Project", text: "State your goal amount, ERC20 token, end date and information on project." },
                     { title: "Fundl", text: "Users fund the project with the specified token." },
                     { title: "Payment Streaming", text: "Payment is Streamed every block to the project owner until End of Project." },
                     { title: "Milestone Based System", text: "Payment Streaming Rate and Threshold is dependent on milestone." },
                     { title: "Boosting", text: "Project Creators can Boost projects for more visibility" },
                     { title: "Voting-based Refund", text: " Users can vote to stop the project for refund in case of lack of activity from the project." },
  ];
  // const features = Array.from({ length: 6 }, () => ({ ...feature }));




  return (
    <div>
      <section className="border-t-border dark:border-t-darkBorder dark:bg-darkBg border-t-2 bg-bg py-20 font-base lg:py-[100px]">
        <h2 className="mb-14 px-5 text-center text-2xl font-heading md:text-3xl lg:mb-20 lg:text-4xl">
          Features
        </h2>

        <div className="mx-auto grid w-container max-w-full grid-cols-1 gap-5 px-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            return (
              <div
                className="border-border dark:border-darkBorder dark:bg-secondaryBlack shadow-light dark:shadow-dark flex flex-col gap-3 rounded-base border-2 bg-white p-5"
                key={i}
              >
                <h4 className="text-xl font-heading">
                {i + 1} {feature.title} 
                </h4>
                <p>{feature.text}</p>
              </div>
            );
          })}
        </div>
      </section>
      <div>
        <Marquee
          className="border-y-border dark:border-y-darkBorder dark:border-darkBorder dark:bg-secondaryBlack border-y-2 bg-white py-3 font-base sm:py-5"
          direction="left"
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
