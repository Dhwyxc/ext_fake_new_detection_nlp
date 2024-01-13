import React, { useEffect, useState } from 'react'
import {
  Button,
  Textarea,
  Modal,
  Text,
  useModal,
  Loading,
} from '@nextui-org/react'
import { useMutation } from 'react-query'
import CustomCard from '../Card/index'
const BASE_URL_BE = 'https://pc0nqvw0-8000.asse.devtunnels.ms/api/v1/'
const App = (): JSX.Element => {
  const { setVisible, bindings } = useModal()
  const [text, setText] = useState<string>()
  const [title, setTitle] = useState<string>()
  const [content, setContent] = useState<string>()
  const [link, setLink] = useState<string>()
  const [rs, setRS] = useState<any>()
  const [post, setPost] = useState<any>()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDetect, setIsLoadingDetect] = useState(false)

  const predict = (model: string) => {
    setIsLoadingDetect(true);
    const formData = new FormData()
    formData.append('text', text || '')
    formData.append('model', model)
    fetch(`${BASE_URL_BE}predict/`, {
      body: JSON.stringify({ text, model }),
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setRS(data);
        setIsLoadingDetect(false);
      })
      fetchData();
  }
  useEffect(() => {
    chrome.tabs.executeScript(
      { code: 'window.getSelection().toString();' },
      (selectedText) => {
        setText(selectedText[0])
      },
    )
  })
  console.log(rs)

  async function fetchData() {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL_BE}recommend/`, {
        method: 'post',
        body: JSON.stringify({ text }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch data from the API');
      }
  
      const responseData = await response.json();
      setPost(responseData);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  }
  console.log(post);
  
  const { mutate: create, isLoading: loadingCreate } = useMutation<
    any,
    any,
    any,
    any
  >({
    mutationFn: async ({ title, content, link }) => {
      const data = await fetch(`${BASE_URL_BE}post-community/`, {
        body: JSON.stringify({ title, content, link }),
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      
      return data
    },
  })
  const [tab, setTab] = useState(1)
  const submit = () => {
    create(
      { title, content, link },
      {
        onSuccess: () => {
          setVisible(true)
        },
      },
    )
  }
  return (
    <div
      style={{
        color: '#ffffff',
        padding: 20,
        width: 350,
        fontFamily: 'monospace',
      }}
    >
      <p style={{ textAlign: 'center', fontSize: 32, fontWeight: 'bold' }}>
        News Detection
      </p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <Button 
          color="success"
          ghost={tab === 2}
          onPress={() => setTab(1)}
          size={'sm'}
        >
          <span style={{ fontWeight: 'bold', fontSize: 20 }}>Detection</span>
        </Button>
        <Button
          color="primary"
          ghost={tab === 1}
          onPress={() => setTab(2)}
          size={'sm'}
        >
          <span style={{ fontWeight: 'bold', fontSize: 20 }}>Community</span>
        </Button>
      </div>
      <div>
        {tab === 1 && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                gap: 10,
              }}
            >
              <Button
                color="gradient"
                onPress={() => predict("RNN")}
                size={'sm'}
              >
                <span style={{ fontWeight: 'bold', fontSize: 20 }}>Detect</span>
              </Button>
            </div>
            {isLoadingDetect ? (
              <Loading color="currentColor" size="sm" />
            ): (
             rs && (
              <p
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: 'white',
                  textAlign: 'left',
                }}
              >
                Predict: {rs?.predict === 0
                    ? 'Real'
                    : rs?.predict === 2
                    ? 'No Text Selected'
                    : 'Unsubstantiated'}
                {" - "}
                Topic: {rs?.topic}
              </p>
              ))}
            {text && (
              <div style={{ overflow: 'auto', maxHeight: 200 }}>
                <p
                  style={{
                    fontFamily: 'monospace',
                    color: 'ghostwhite',
                    fontSize: 18,
                  }}
                >
                  Detect for: {'"'}
                  {text}
                  {'"'}
                </p>
              </div>
            )}
            {isLoading ? (
              <Loading color="currentColor" size="sm" />
            ) : (
              <div>
                {post?.length > 0 && (
                  <div>
                    <h3>Recommend</h3>
                    <div className="flex flex-row space-y-2">
                      {post?.map((e:any) => {
                        return <CustomCard {...e?.post} key={e?.post?.id} />
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {tab === 2 && (
          <div>
            <h2>Community</h2>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <form action="">
                <div>
                  <Textarea
                    onChange={(e) => setTitle(e?.target?.value)}
                    value={title}
                    label="Title"
                    size="xl"
                    minRows={1}
                    maxRows={1}
                  />
                </div>
                <div>
                  <Textarea
                    onChange={(e) => setContent(e?.target?.value)}
                    value={content}
                    label="Content"
                    minRows={2}
                    maxRows={2}
                    size="xl"
                  />
                </div>
                <div>
                  <Textarea
                    value={link}
                    onChange={(e) => setLink(e?.target?.value)}
                    label="Link"
                    minRows={1}
                    maxRows={1}
                    size="xl"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  {' '}
                  <Button
                    onClick={submit}
                    type="button"
                    style={{ marginTop: 10 }}
                    color="success"
                  >
                    {loadingCreate ? (
                      <Loading color="currentColor" size="sm" />
                    ) : (
                      'Submit'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Modal
        scroll
        width="600px"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        {...bindings}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            Tạo thành công
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Text id="modal-description">
            Cảm ơn bạn đã đóng góp thông tin, chúng tôi sẽ sớm duyệt tin của bạn!
          </Text>
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onPress={() => setVisible(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
export default App
