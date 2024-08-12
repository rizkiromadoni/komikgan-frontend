import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const FormActionMobile = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center gap-2 md:hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate("..", { relative: "path" })}
        type="button"
      >
        Discard
      </Button>
      <Button size="sm" type="submit">
        Save Post
      </Button>
    </div>
  );
};

export default FormActionMobile;
