import { DiscussionEmbed } from 'disqus-react';
import NotFound from "@/components/NotFound";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { createBookmark, deleteBookmark } from "@/services/bookmarkService";
import { getSerie } from "@/services/serieService";
import {
  faBookOpen,
  faHeart,
  faMessage,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const SingleSeries = () => {
  const { user } = useAuth()
  const { slug } = useParams();
  const queryClient = useQueryClient()
  const [bookmarked, setBookmarked] = useState(false)
  const [bookmarkPending, setBookmarkPending] = useState(true)

  const { data, isPending } = useQuery({
    queryKey: ["series", { slug }],
    queryFn: async () => await getSerie(slug!),
    retry: false,
    staleTime: Infinity,
  });
  
  const createBookmarkMutation = useMutation({
    mutationKey: ["create-bookmark"],
    mutationFn: createBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["series", { slug }] })
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] })
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      setBookmarked(true)
    },
    onMutate: () => {
      setBookmarkPending(true)
    },
    onSettled: () => {
      setBookmarkPending(false)
    }
  })

  const deleteBookmarkMutation = useMutation({
    mutationKey: ["delete-bookmark"],
    mutationFn: deleteBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["series", { slug }] })
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] })
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      setBookmarked(false)
    },
    onMutate: () => {
      setBookmarkPending(true)
    },
    onSettled: () => {
      setBookmarkPending(false)
    }
  })

  useEffect(() => {
    if (data?.bookmarks.isBookmarked) {
      setBookmarked(true)
    }

    setBookmarkPending(false)
  }, [data?.bookmarks])

  if (!isPending && !data) return <NotFound />

  const handleBookmark = async () => {
    if (bookmarked) {
      deleteBookmarkMutation.mutate(data?.id)
    } else {
      createBookmarkMutation.mutate(data?.id)
    }
  }

  return (
    <main className="min-h-[68vh] mb-10">
      <div className="bg-[#2f303e] relative overflow-hidden">
        <div className="bg-cover bg-center h-72" style={{
          backgroundImage: `url(${data?.imageUrl || ""})`,
          filter: "blur(10px) brightness(0.5) contrast(1)",
        }} />
      </div>
      <div className="relative max-w-5xl mx-auto flex gap-4 flex-col md:flex-row px-4 -mt-48 md:-mt-20">
        <div className="flex flex-col justify-center items-center md:justify-start md:items-start gap-4 min-w-[250px] md:w-[250px]">
          <img
            src={data?.imageUrl || ""}
            alt=""
            width={250}
            height={344}
            className="rounded-lg w-[250px] h-[344px] shadow-md"
          />
          <h1 className="text-2xl font-bold text-center md:hidden text-[#444444] dark:text-[#9ca9b9]">
            {data?.title}
          </h1>
          <div className="flex flex-col gap-2 w-full">
            <div className="grid grid-cols-2 bg-slate-200 rounded-full overflow-hidden text-sm">
              <div className="flex items-center justify-center font-semibold bg-[#ff5a5a] py-3 text-white">
                {data?.seriesType.toUpperCase()}
              </div>
              <div className="flex items-center justify-center font-semibold bg-[#6cc174] py-3 text-white">
                {data?.seriesStatus.toUpperCase()}
              </div>
            </div>
            <div className="bg-gray-200 dark:bg-[#38394a] dark:text-[#9ca9b9] rounded-full flex items-center justify-center py-2 font-semibold text-md gap-2">
              <FontAwesomeIcon icon={faStar} fill="#ffdd73" color="#ffdd73" />
              {data?.rating}
            </div>
            <Button className={cn(
              "rounded-full flex items-center justify-center py-2 font-semibold text-md gap-2 text-white",
              {
                "bg-[#c15656] hover:bg-[#ff5a5a]": !bookmarked,
                "bg-[#6cc174] hover:bg-[#6cc174]": bookmarked,
                "cursor-not-allowed": bookmarkPending
              }
            )} onClick={handleBookmark} disabled={bookmarkPending || !user}>
              {user ? (
                <>
                  <FontAwesomeIcon icon={faHeart} />
                  {bookmarked ? "Bookmarked" : "Bookmark"}
                </>
              ) : "Login to Bookmark"}
            </Button>
            <div className="flex justify-center dark:text-[#9ca9b9] text-sm">
              <p>{data?.bookmarks?.count} Users Bookmarked</p>
            </div>
            <ul className="bg-gray-200 dark:bg-[#3b3c4c] dark:text-[#9ca9b9] p-5 rounded-md flex flex-col gap-2">
              <li className="flex flex-col gap-2">
                <p className="font-semibold">Alternative</p>
                <p className="text-sm">{data?.alternative}</p>
              </li>
              <li className="flex flex-col gap-2">
                <p className="font-semibold">Published</p>
                <p className="text-sm">{data?.released}</p>
              </li>
              <li className="flex flex-col gap-2">
                <p className="font-semibold">Author</p>
                <p className="text-sm">{data?.author}</p>
              </li>
              <li className="flex flex-col gap-2">
                <p className="font-semibold">Artist</p>
                <p className="text-sm">{data?.artist}</p>
              </li>
              <li className="flex flex-col gap-2">
                <p className="font-semibold">Posted By</p>
                <p className="text-sm">{data?.user?.username}</p>
              </li>
              <li className="flex flex-col gap-2">
                <p className="font-semibold">Total Chapters</p>
                <p className="text-sm">? Chapter</p>
              </li>
              <li className="flex flex-col gap-2">
                <p className="font-semibold">Serialization</p>
                <p className="text-sm">{data?.serialization}</p>
              </li>
            </ul>
          </div>
        </div>
        <div className="md:mt-8 w-full">
          <h1 className="hidden md:block text-2xl font-semibold mb-6 text-white dark:text-[#9ca9b9]">
            {data?.title}
          </h1>
          <div className="flex flex-wrap gap-2 py-3">
            {data?.genres &&
              data?.genres.map((genre: any) => (
                <Link
                  key={genre.id}
                  to={`/genres/${genre.slug}`}
                  className="py-2 px-4 bg-gray-200 dark:bg-[#3b3c4c] rounded-md hover:bg-[#6e6dfb] hover:text-white dark:hover:bg-[#6e6dfb] dark:hover:text-white transition"
                >
                  {genre.name}
                </Link>
              ))}
          </div>
          <p className="dark:text-[#9ca9b9]">{data?.description}</p>
          <div className="mt-4">
            <h2 className="mb-4 text-2xl font-semibold ">
              <span className="text-[#6e6dfb]">Chapter</span> List
            </h2>
            <ul className="flex flex-col max-h-[596px] gap-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#6e6dfb] scrollbar-track-[#3b3c4c] pr-1">
              {data?.chapters?.length > 0 ? (
                data?.chapters?.sort((a: any,b: any ) => b.id - a.id).map((chapter: any) => (
                  <Link to={`/${chapter.slug}`} key={chapter.id}>
                    <li className="bg-gray-200 dark:bg-[#3b3c4c] dark:text-[#9ca9b9] rounded-md flex gap-2 p-1 dark:hover:bg-[#6e6dfb] dark:hover:text-white hover:bg-[#6e6dfb]  hover:text-white group">
                      <div className="p-3 bg-gray-300 dark:bg-[#48495b] rounded-lg group-hover:bg-[#605fe0]">
                        <FontAwesomeIcon
                          icon={faBookOpen}
                          className='dark:text-[#eeeeee]'
                          size="lg"
                        />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-base">Chapter {chapter.chapter}</p>
                        <p className="text-xs">
                          {new Date(chapter.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </li>
                  </Link>
                ))
              ) : (
                <div> No Chapters yet</div>
              )}
            </ul>
            <div className="flex flex-col gap-2">
              <h2 className="w-full py-4 text-2xl font-semibold text-left flex gap-2 items-center">
                <FontAwesomeIcon
                  icon={faMessage}
                  fill="#6e6dfb"
                  color="#6e6dfb"
                />{" "}
                Comments
              </h2>
              <DiscussionEmbed
                shortname="komikgan-1"
                config={{
                  url: new URL(`/series/${data?.slug}`, import.meta.env.VITE_APP_URL).href,
                  identifier: data?.slug,
                  title: data?.title,
                  language: "id_ID"
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SingleSeries;
