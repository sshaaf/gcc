import { getContact } from "@/lib/content";
import { Reveal } from "./Reveal";

export async function Ground() {
  const contact = await getContact();
  return (
    <section className="ground-band" id="ground" style={{ padding: "110px 0" }}>
      <div className="oval" aria-hidden="true" />
      <div className="wrap">
        <Reveal className="ground-inner">
          <p className="kicker">The Ground</p>
          <h2 className="disp">Denmark&rsquo;s most beautiful cricket ground</h2>
          <p>
            Home is {contact.venue}, in the heart of Glostrup — a true cricket oval
            with a clubhouse, excellent training facilities, and sixty-seven
            summers of history in the outfield.
          </p>
          <p className="addr">{contact.addressLines.join(" · ")}</p>
        </Reveal>
      </div>
    </section>
  );
}