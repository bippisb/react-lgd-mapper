
export const Notes = () => (
    <div className="p-2 ml-4">
        <ol className="list-decimal list-outside">
            <li>
                <h5 className="h5 text-xl ">Serialization</h5>
                <p className="pl-2">Save work, continue from a point of incomplete mapping</p>
            </li>
            <li>
                <h5 className="h5 text-xl">Neighbour-based Matching</h5>
                <p className="pl-2">Match entity based on inNeighbours and outNeighbors</p>
            </li>
            <li>
                <h5 className="h5 text-xl">Community Proposed Variations</h5>
                <p className="pl-2">Enter email along with the variation name.</p>
            </li>
            <li>
                <h5 className="h5 text-xl">Input File Formats</h5>
                <p className="pl-2">Parquet and excel.</p>
            </li>
            <li>
                <h5 className="h5 text-xl">SQL in Browser</h5>
                <p className="pl-2">Work without a backend, load lgd database using sqlachemy.</p>
            </li>
            <li>
                <h5 className="h5 text-xl">Pyodide Web Worker</h5>
                <p className="pl-2">Python runs on a thread separate from javascript.</p>
            </li>
        </ol>
    </div>
)