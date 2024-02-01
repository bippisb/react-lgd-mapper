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
            <input type="file" accept='.csv' onChange={handleChange} />
        </div>
    )
}