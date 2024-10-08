import Pagination from "@/components/custom/pagination";
import { formatRelativeTime } from "@/lib/utils";
import { getLatestUpdate, getReccomendation } from "@/services/serieService";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";

const Home = () => {
  const [searchParams] = useSearchParams();
  const { data: recommendation } = useQuery({
    queryKey: ["series", { key: "recommendation" }],
    queryFn: async () => await getReccomendation()
  })

  const { data } = useQuery({
    queryKey: [
      "series",
      {
        key: "latest-update",
        page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      },
    ],
    queryFn: async () =>
      await getLatestUpdate({
        limit: 9,
        page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      }),
  });

  return (
    <main>
      <div className="w-full bg-gray-100 dark:bg-[#343544]">
        <div className="max-w-5xl m-auto flex flex-col gap-4 px-4 py-4 w-full">
          <h2 className="text-2xl font-semibold text-left">
            <span className="text-[#6e6dfb]">Popular</span> Manga
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {recommendation?.map((serie: any) => (
              <Link to={`/series/${serie?.slug}`} className="flex flex-col gap-2 hover:text-[#6e6dfb] hover:scale-105 duration-300 relative">
                <img src={serie?.imageUrl}  className="rounded-lg shadow-lg object-cover md:h-52 h-48 w-full"/>
                <h1 className="text-center font-semibold line-clamp-2">{serie?.title}</h1>
                <div className="absolute top-0 left-0 bg-red-400 px-2 py-1 text-xs italic text-white rounded-tl-lg rounded-br-lg">{serie?.seriesType?.toUpperCase()}</div>
            </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-5xl m-auto flex flex-col gap-4 my-5 px-4 w-full">

        <div className="flex justify-between">
          <h2 className="w-full text-2xl font-semibold text-left">
            <span className="text-[#6e6dfb]">Latest</span> Update
          </h2>
        </div>

        <div className="flex flex-col justify-center gap-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.data?.map((serie: any) => (
              <div
                className="pb-4 border-b-2 border-dashed border-gray-300 dark:border-[#45475a] flex w-full h-auto gap-2"
                key={serie.id}
              >
                <Link
                  to={`/series/${serie.slug}`}
                  className="w-24 h-36 border-2 rounded-md border-gray-400 dark:border-[#45475a] flex-none overflow-hidden relative"
                >
                  <img
                    src={serie.imageUrl}
                    alt={serie.title}
                    className="hover:scale-125 transition-all object-fill w-full h-full"
                  />
                </Link>
                <div className="w-full h-full truncate ml-2">
                  <Link
                    to={`/series/${serie.slug}`}
                    className="text-[16px] font-semibold hover:text-[#6e6dfb] transition-colors"
                  >
                    {serie.title}
                  </Link>
                  <ul className="grid grid-cols-1 gap-1 mt-2">
                    {serie?.chapters?.map((chapter: any) => (
                      <li className="flex justify-between" key={chapter.id}>
                        <Link
                          to={`/${chapter.slug}`}
                          className="px-4 py-1 text-[15px] bg-gray-200 dark:text-[#eeeeee] dark:bg-[#3b3c4c] hover:bg-[#6e6dfb] hover:text-[#ffffff] dark:hover:bg-[#6e6dfb] dark:hover:text-[#ffffff] rounded-full transition-colors"
                        >
                          Chapter {chapter.chapter}
                        </Link>
                        <span className="text-[14px] text-[#999999] font-light p-[3px]">
                          {formatRelativeTime(chapter.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <Pagination totalPages={data?.totalPages} />
        </div>
      </div>
    </main>
  );
};

export default Home;
