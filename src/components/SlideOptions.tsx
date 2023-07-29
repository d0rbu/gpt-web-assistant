import { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';


export default function(props: { options: any[], option: any, setOption: (option: any) => void, width: number }) {
  const getStartingIdx = () => {
    const startingIdx = props.options.indexOf(props.option);
    if (startingIdx !== -1) {
      return startingIdx;
    } else {
      return 0;
    }
  }

  const [idx, setIdx] = useState<number>(getStartingIdx());

  useEffect(() => {
    console.log(idx);
    props.setOption(props.options[idx]);
  }, [idx]);

  return (
    <div className="w-5/6 flex flex-row">
      <button onClick={(e) => setIdx(Math.max(0, idx - 1))} disabled={idx === 0} className="w-1/6">
        <ChevronLeftIcon className={`${idx === 0 ? "dark:text-gray-500 text-gray-600" : "dark:text-gray-300 text-gray-800}"}`} />
      </button>
      <div className={`float-left w-${props.width} overflow-x-hidden flex`}>
        <div className={`flex flex-row justify-start items-center -ml-${props.width * idx} ease-out duration-200`}>
          {
            props.options.map((option, index) => {
              return (
                <div className={`w-${props.width} text-center`} key={index}>
                  <h1 className="text-lg">{option}</h1>
                </div>
              )
            }
            )
          }
        </div>
      </div>
      <button onClick={(e) => setIdx(Math.min(props.options.length - 1, idx + 1))} disabled={idx === props.options.length - 1} className="w-1/6">
        <ChevronRightIcon className={`${idx === (props.options.length - 1) ? "dark:text-gray-500 text-gray-600" : "dark:text-gray-300 text-gray-800}"}`}/>
      </button>
    </div>
  )
}