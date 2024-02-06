import { ChangeEvent, FC } from 'react';

interface FileUploaderProps {
    onFileLoad: (df: any) => void;
}


export const FileUpload: FC<FileUploaderProps> = ({ onFileLoad }) => {

    const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;

        if (fileList && fileList.length > 0) {
            const file = fileList[0];
            console.log(file)
            const df = await dfd.readCSV(file);
            // @ts-ignore
            window.df = df;
            console.log(df)
            onFileLoad(df);
        }
    }
    return (
        <div>
            <input
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                id="file_input"
                type="file"
                accept=".csv"
                onChange={handleChange} />
        </div>
    )
}