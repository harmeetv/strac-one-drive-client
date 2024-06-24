import React, { useState } from 'react';
import {
    AutoSizer,
    Column,
    InfiniteLoader,
    Table,
    WindowScroller
  } from "react-virtualized";
import useLegacyEffect from '../hooks/useLegacyEffect';
import axios from 'axios';
import { useAuth } from '../AuthProvider';
import "./index.less"
import RowsLoader from './RowsLoader';

const FileViewer: React.FC = () => {
    const { accessToken } = useAuth() || {};
    const [files, setFiles] = useState<any[]>([]);
    const [permissions, setPermissions] = useState<{ [key: string]: any[] }>({});
    const [nextLink, setNextLink] = useState(null);
    const [currentFolderId, setCurrentFolderId] = useState('root');
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [folderPath, setFolderPath] = useState([{ id: 'root', name: 'Root' }]);
    const [shownIndicesRange, setShownIndicesRange] = useState<[number, number] | null>(null);

    const fetchFilePermissions = async (fileId: string): Promise<{ fileId: string, permissions: any[] }> => {
        try {
          const response = await axios.get(
            `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/permissions`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
      
          return { fileId, permissions: response.data.value };
        } catch (error) {
          console.error(error);
          return { fileId, permissions: [] };
        }
    };

    const fetchFiles = async (folderId = 'root', nextPageUrl = null) => {
        if (nextPageUrl === "end")
            return;
        try {
            setIsNextPageLoading(true);    
            const response = await axios.get(
                nextPageUrl || `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children?$top=20`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
    
            const newFiles = response.data.value;
            setFiles(prevFiles => [...prevFiles, ...newFiles]);
            setNextLink(response.data['@odata.nextLink'] || "end");
    
            // Fetch permissions for new files in parallel
            const permissionPromises = newFiles.map((file: { id: string; }) =>
                fetchFilePermissions(file.id)
            );
    
            const permissionsArray = await Promise.all(permissionPromises);
            const permissionsObject = permissionsArray.reduce((acc, cur) => {
                acc[cur.fileId] = cur.permissions;
                return acc;
            }, {});
    
            setPermissions(prevPermissions => ({
                ...prevPermissions,
                ...permissionsObject
            }));
        } catch (error) {
            console.error(error);
        } finally {
            setIsNextPageLoading(false);
        }
    };

    useLegacyEffect(() => {
        if (accessToken) {
            fetchFiles();
        }
    }, [accessToken]);

    const handleDownload = async (fileId: string) => {
        try {
          const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            }
          });
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = fileId; // You can set a custom filename here if you want
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error("Error downloading file:", error);
        }
    };
    
    const navigateToFolder = (file: { folder: any; id: string; name: string }) => {
        if (!file.folder)
          return;
        setFiles([]);
        setPermissions({});
        setCurrentFolderId(file.id);
        setFolderPath((prevPath) => [...prevPath, { id: file.id, name: file.name }]);
        fetchFiles(file.id);
        setNextLink(null)
    };


    const isRowLoaded = ({ index }: { index: number }) => {
        return !!files[index];
    }

    const handleRowsRendered = ({ startIndex, stopIndex }: { startIndex: number, stopIndex: number }) => {
        setShownIndicesRange([startIndex, stopIndex]);
    }

    useLegacyEffect(() => {
        const interval = setInterval(() => {
            if (accessToken) {
                if (!shownIndicesRange) return;
                for (let i = shownIndicesRange[0]; i <= shownIndicesRange[1]; i++) {
                    const file = files[i];
                    if (file && !permissions[file.id]) {
                        fetchFilePermissions(file.id).then(({ fileId, permissions }) => {
                            setPermissions(prevPermissions => ({
                                ...prevPermissions,
                                [fileId]: permissions
                            }));
                        });
                    }
                }
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [accessToken, shownIndicesRange]);

    const nameRenderer = ({ rowData: file }) => {
        return (
            <div className="file-name">
              <div className='file-icon'>
                {!!file.folder && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A4A4A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2z"></path></svg>}
                {!file.folder && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A4A4A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>}
              </div>
              {
                !!file.folder && (file.name.length > 40 ? (
                    <span className="link-like" onClick={() => navigateToFolder(file)} title={file.name}>{file.name.slice(0, 40)}...</span>
                  ) : (
                    <span className="link-like" onClick={() => navigateToFolder(file)} title={file.name}>{file.name}</span>
                  ))
              }
              {
                !file.folder && (file.name.length > 40 ? (
                    <span title={file.name}>{file.name.slice(0, 40)}...</span>
                ) : (
                    <span title={file.name}>{file.name}</span>
                ))
              }
            </div>
        );
    }

    const permissionsRenderer = ({ rowData: file }) => {
      const fileId = file.id;
      const filePermissions = permissions[fileId];
      if (!filePermissions) {
        return "Loading permissions...";
      }

      const permissionElements = filePermissions.map(permission => {
        if (!permission.grantedTo && permission.link?.webUrl) {
          return (
            <div className="user-circle"
              title="Anyone with Link"
            >
              <div
                className="initials"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              </div>
            </div>
          );
        }
        return (
          <div className="user-circle" title={permission.grantedTo?.user?.displayName ? `${permission.grantedTo.user.displayName} <${permission.invitation.email}>` : permission.invitation.email}>
            <div
              className="initials"
            >
              {permission.grantedTo?.user?.displayName ? permission.grantedTo?.user?.displayName.charAt(0).toUpperCase() : permission.invitation.email.charAt(0).toUpperCase()}
            </div>
          </div>
        )
      });
      return <div className="file-permissions"><div className='user-container'>{permissionElements}</div></div>;
    }
    
    const actionsRenderer = ({ rowData: file }) => {
        return (
            <div className="file-download">
              {!!file.file && (
                <button onClick={() => handleDownload(file.id)}>Download</button>
              )}
            </div>
        );
    }

    const loadMoreRows = isNextPageLoading ? async () => {} : () => fetchFiles(currentFolderId, nextLink)

    const navigateToPath = (pathIndex: number) => {
        const newPath = folderPath.slice(0, pathIndex + 1);
        const folderId = newPath[newPath.length - 1].id;
        setFiles([]);
        setPermissions({});
        setCurrentFolderId(folderId);
        setFolderPath(newPath);
        fetchFiles(folderId);
        setNextLink(null)
    };

    const Breadcrumbs = () => (
        <div className="breadcrumbs">
          {folderPath.map((folder, index) => (
            <span key={folder.id} className='breadcrumb-path'>
              {index > 0 && <span className='breadcrumb-separator'>&gt;</span>}
              <span onClick={() => navigateToPath(index)} style={{ cursor: 'pointer', color: 'blue' }}>
                {folder.name}
              </span>
            </span>
          ))}
        </div>
    );

    if (!accessToken) {
        return <div>Please log in to view your files.</div>;
    }

    return (
        <div className='file-viewer'>
            <Breadcrumbs />
            {
                !files.length ? <span>{nextLink === null ? "Loading initial files" : "No Files Found"}</span> : (
                    <div style={{minHeight: "100vh"}} className="files-wrapper">
                        <AutoSizer disableHeight={true}>
                            {({ width }) => (
                                <WindowScroller>
                                    {({ height, isScrolling, onChildScroll, scrollTop }) => (
                                        <InfiniteLoader
                                            isRowLoaded={isRowLoaded}
                                            loadMoreRows={loadMoreRows}
                                            rowCount={1000}
                                        >
                                        {({ onRowsRendered, registerChild }) => (
                                            <Table
                                                autoHeight
                                                ref={registerChild}
                                                onRowsRendered={(...args) => {
                                                    onRowsRendered(...args);
                                                    handleRowsRendered(...args);
                                                }}
                                                isScrolling={isScrolling}
                                                onScroll={onChildScroll}
                                                width={width}
                                                height={height}
                                                headerHeight={48}
                                                rowHeight={48}
                                                rowCount={files.length}
                                                rowGetter={({ index }) => files[index]}
                                                scrollTop={scrollTop}
                                                rowStyle={{ display: 'flex' }}
                                                headerClassName='table-header'
                                            >
                                                <Column
                                                    label="Name"
                                                    dataKey="name"
                                                    flexGrow={1}
                                                    width={200} // Add the width prop with a value
                                                    cellRenderer={nameRenderer}
                                                />
                                                <Column
                                                    label="Users with Access"
                                                    dataKey="permissions"
                                                    flexGrow={1}
                                                    width={100}
                                                    cellRenderer={permissionsRenderer}
                                                />
                                                <Column
                                                    label="Actions"
                                                    dataKey="actions"
                                                    flexGrow={1}
                                                    width={200}
                                                    cellRenderer={actionsRenderer}
                                                />
                                            </Table>
                                        )}
                                        </InfiniteLoader>
                                    )}
                                </WindowScroller>
                            )}
                        </AutoSizer>
                        {isNextPageLoading && Array.from({ length: 8 }).map((_, index) => <RowsLoader key={index} />)}
                    </div>
                )
            }
        </div>
    );
}

export default FileViewer;
