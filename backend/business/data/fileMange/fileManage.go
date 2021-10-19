package fileMange

import (
	"io"
	"log"
	"os"

	"github.com/pkg/errors"
)

type FileMange struct {
	log             *log.Logger
	MaxMultipartMem *int
}

func New(log *log.Logger, maxMultipartMem *int) FileMange {
	return FileMange{
		log:             log,
		MaxMultipartMem: maxMultipartMem,
	}
}

func (fm FileMange) Create(r io.Reader, filename string) error {
	// path, err := is.mkImagePath(galleryID)
	// if err != nil {
	// 	return err
	// }
	// Create a destination file
	dst, err := os.Create("./uploaded/" + filename)
	if err != nil {
		return errors.Wrapf(err, "create file:%v", filename)
	}
	defer dst.Close()
	// Copy reader data to the destination file
	_, err = io.Copy(dst, r)
	if err != nil {
		return errors.Wrapf(err, "copy to file:%v", filename)
	}
	return nil
}

// func (fm FileMange) Path() string {
// 	temp := url.URL{
// 		Path: "/" + i.RelativePath(),
// 	}
// 	return temp.String()
// }

// func (fm FileMange) RelativePath() string {
// 	return fmt.Sprintf("api/images/galleries/%v/%v", i.GalleryID, i.Filename)
// }
// func (fm FileMange) RelativeImgPath() string {
// 	return fmt.Sprintf("images/galleries/%v/%v", i.GalleryID, i.Filename)
// }

// func (fm FileMange) Delete(i *Image) error {
// 	fmt.Println(i.RelativeImgPath())
// 	return os.Remove(i.RelativeImgPath())
// }

// func (fm FileMange) imagePath(galleryID uint) string {
// 	return fmt.Sprintf("images/galleries/%v/", galleryID)
// }

// func (fm FileMange) mkImagePath(galleryID uint) (string, error) {
// 	galleryPath := is.imagePath(galleryID)
// 	err := os.MkdirAll(galleryPath, 0755)
// 	if err != nil {
// 		return "", err
// 	}
// 	return galleryPath, nil
// }
