import { ExternalLink, Copyright } from "lucide-react";

const Bottombar = () => {
  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-6 py-4 text-center">
        <p className="text-sm text-muted-foreground text-center">
          Crafted by{" "}
          <span className="inline-flex items-center group">
            <a
              href="https://github.com/Maher-Elmair"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium inline-flex items-center transition-colors"
            >
              Maher Elmair
            </a>
            <span className="inline-flex items-center justify-center w-3 h-3 ml-1 relative">
              {/*icon copyright*/}
              <Copyright
                size={12}
                strokeWidth={1.5}
                className="absolute inset-0 transition-all duration-300 group-hover:scale-0 group-hover:opacity-0"
              />
              {/*icon external link*/}
              <ExternalLink
                size={12}
                strokeWidth={1.5}
                className="text-primary absolute inset-0 scale-0 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
              />
            </span>
          </span>{" "}
          {new Date().getFullYear()} to help you build better habits
        </p>
      </div>
    </footer>
  );
};

export default Bottombar;
