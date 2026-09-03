export default function Hero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-[linear-gradient(91deg,#867971_29%,#6F625A_98%)]"
    >
      {/* reserves the space the fixed site header floats over (measured at runtime,
          with a per-breakpoint fallback for the first paint) */}
      <div className="h-[var(--header-height,84px)] sm:h-[var(--header-height,72px)] lg:h-[var(--header-height,84px)] 2xl:h-[var(--header-height,108px)]" />

      <div className="relative flex min-h-[380px] flex-col justify-between sm:min-h-[480px] lg:min-h-[max(460px,58vh)] 2xl:min-h-[max(600px,64vh)]">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          poster="/images/hero-box.png"
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          aria-hidden="true"
        >
          <source src="/videos/hero-box.mp4" type="video/mp4" />
        </video>

        <div className="relative z-10 flex flex-col items-center px-6 pt-5 text-center sm:pt-6 lg:pt-6 2xl:pt-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#F1D9C1] sm:text-sm lg:text-base 2xl:text-2xl">
            A Gift That
          </p>
          <h1
            className="mt-1 max-w-3xl text-3xl italic leading-[1.35] text-[#F1D9C1] sm:text-4xl lg:max-w-3xl lg:text-5xl 2xl:max-w-6xl 2xl:text-[6.125rem]"
            style={{ fontFamily: "var(--font-serif-display)" }}
          >
            Will Be Remembered.
          </h1>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-2 px-6 pb-6 text-center sm:pb-8 lg:gap-3 lg:pb-10 2xl:gap-4 2xl:pb-[5.7rem]">
          <p
            className="max-w-md text-lg italic leading-[1.35] text-[#F1D9C1] sm:max-w-xl sm:text-xl lg:max-w-2xl lg:text-2xl 2xl:max-w-[1175px] 2xl:text-[2.391rem]"
            style={{ fontFamily: "var(--font-serif-display)" }}
          >
            Premium Corporate Gifts In Stunning, Customizable Packaging.
          </p>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#F1D9C1] sm:text-xs lg:text-sm 2xl:text-base">
            Fast Turnaround. White-Glove Service.
          </p>
        </div>
      </div>
    </section>
  );
}
