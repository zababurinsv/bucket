export default (fs = {}) => {
  return new Promise(async (resolve, reject) => {
    resolve({
      symlink: (oldPath, newPath) => {
        fs.symlink(oldPath, newPath);
      },
      unmount: (mountPoint = './fs') => {
        fs.unmount(mountPoint)
      },
      fsLoad: () => {
        return new Promise(async (resolve, reject) => {
          fs.syncfs(true,  (err) => {
            if(err) {
              resolve({
                status: "false",
                success: false,
                message: err
              })
            } else {
              console.log('file load')
              resolve({
                status: "true",
                success: true,
                message: 'file load'
              })
            }
          });
        })
      },
      fsSave: () => {
        return new Promise(async (resolve, reject) => {
          fs.syncfs(false , (err) => {
            if(err) {
              resolve({
                status: "false",
                success: false,
                message: err
              })
            } else {
              console.log('file save')
              resolve({
                status: "true",
                success: true,
                message: 'file save'
              })
            }
          });
        })
      },
      mkdir: (path) => {
        return new Promise(async (resolve, reject) => {
          try {
            resolve({
              status: true,
              success: true,
              message: await fs.mkdir(path)
            })
          }catch (e) {
            resolve({
              status: false,
              success: false,
              message: e
            })
          }
        })
      },
      readdir: (path) => {
        return new Promise(async (resolve, reject) => {
          try {
            resolve({
              status: true,
              success: true,
              message: await fs.readdir(path)
            })
          }catch (e) {
            resolve({
              status: false,
              success: false,
              message: e
            })
          }
        })
      },
      rmdir: (path) => {
        return new Promise(async (resolve, reject) => {
          try {
            resolve({
              status: true,
              success: true,
              message: await fs.rmdir(path)
            })
          }catch (e) {
            resolve({
              status: false,
              success: false,
              message: e
            })
          }
        })
      },
      cwd: (path) => {
        return new Promise(async (resolve, reject) => {
          try {
            resolve({
              status: true,
              success: true,
              message: await fs.cwd()
            })
          }catch (e) {
            resolve({
              status: false,
              success: false,
              message: e
            })
          }
        })
      },
      rename: (file, result) => {
        return new Promise(async (resolve, reject) => {
          try {
            resolve({
              status: true,
              success: true,
              message: await fs.rename(file, result)
            })
          }catch (e) {
            resolve({
              status: false,
              success: false,
              message: e
            })
          }
        })
      },
      readFile: (file, encoding = "utf8") => {
        return new Promise(async (resolve, reject) => {
          try {
            resolve({
              status: true,
              success: true,
              message: await fs.readFile(file, { encoding: encoding })
            })
          }catch (e) {
            resolve({
              status: false,
              success: false,
              message: e
            })
          }
        })
      },
      unlink: (file) => {
        return new Promise(async (resolve, reject) => {
          try {
            resolve({
              status: true,
              success: true,
              message: await fs.unlink(file)
            })
          }catch (e) {
            resolve({
              status: false,
              success: false,
              message: e
            })
          }
        })
      },
      writeFile: (file, contents) => {
        return new Promise(async (resolve, reject) => {
          try {
           let writeFile =  await fs.writeFile(file, contents)
            resolve({
              status: true,
              success: true,
              message: writeFile
            })
          }catch (e) {
            resolve({
              status: false,
              success: false,
              message: e
            })
          }
        })
      },
      createDataFile: (folder, file, contents, readable = true, writable = true ) => {
        return new Promise(async (resolve, reject) => {
          try {
            resolve({
              status: true,
              success: true,
              message: await fs.createDataFile(folder, file, contents, readable, writable)
            })
          }catch (e) {
            resolve({
              status: false,
              success: false,
              message: e
            })
          }
        })
      }
    })
  })
}
