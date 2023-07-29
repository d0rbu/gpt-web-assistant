


export default function(props: { name: string, children: React.ReactNode }) {
    return (
      <div className="w-full flex flex-col">
        <div className="w-full flex flex-row">
          <h1 className="text-lg w-1/2">{props.name}</h1>
          <div className="w-1/2 flex flex-row justify-end items-center">
            {props.children}
          </div>
        </div>
      </div>
    );
  }