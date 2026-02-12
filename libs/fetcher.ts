<<<<<<< HEAD
import axios from 'axios';

const fetcher = (url: string) => axios.get(url).then(res => res.data);
=======
import axios from "axios";

const fetcher = async (url: string) => {
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (err: any) {
    throw new Error(err?.response?.data?.error || "Fetch failed");
  }
};
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)

export default fetcher;
